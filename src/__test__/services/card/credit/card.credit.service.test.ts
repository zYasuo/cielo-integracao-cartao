import { describe, it, expect, beforeEach, vi, type MockedFunction } from "vitest"
import { CreditCardService } from "@/services/card/credit/card.credit.service"
import { BaseValidator } from "@/validators/base/base.validator"
import { EResponseError, ECardType, ECurrency, ECountry, EIdentificationType, EBrandCard } from "@/types/enums.types"
import type { ICompleteCardModel } from "@/models/card/credit/card.credit.models"
import type { ICreditCardApiResponse } from "@/types/response.card.credit.types"

vi.mock("@/repositories/card/credit/card.credit.repositories")
vi.mock("@/services/payment/payment.validation.service")
vi.mock("@/validators/base/base.validator")

describe("CreditCardService", () => {
  let service: CreditCardService
  let mockBaseValidator: MockedFunction<any>

  const validCardData: ICompleteCardModel = {
    MerchantOrderId: "TEST123456789",
    Customer: {
      Name: "John Doe",
      Identity: "12345678901",
      IdentityType: EIdentificationType.CPF,
      Email: "john.doe@example.com",
      BirthDate: "1990-01-01",
    },
    Payment: {
      Type: ECardType.CREDIT,
      Amount: 10000,
      Currency: ECurrency.BRL,
      Country: ECountry.BR,
      Installments: 1,
      CreditCard: {
        CardNumber: "4111111111111111",
        Holder: "JOHN DOE",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      },
    },
  }

  const validCieloResponse: ICreditCardApiResponse = {
    PaymentId: "12345678-1234-1234-1234-123456789012",
    Status: "1",
    ReturnCode: "00",
    ReturnMessage: "Transação aprovada",
    AuthorizationCode: "123456",
    ProofOfSale: "123456",
    Tid: "1234567890123456",
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mockBaseValidator = vi.mocked(BaseValidator)

    service = new CreditCardService()
  })

  describe("generateMerchantOrderId", () => {
    it("should generate a unique merchant order ID", () => {
      const orderId1 = service.generateMerchantOrderId()
      const orderId2 = service.generateMerchantOrderId()

      expect(orderId1).toMatch(/^\d{23}$/)
      expect(orderId2).toMatch(/^\d{23}$/)
      expect(orderId1).not.toBe(orderId2)
    })

    it("should generate order ID with correct format", () => {
      const orderId = service.generateMerchantOrderId()

      expect(orderId).toHaveLength(23)
      expect(orderId).toMatch(/^\d+$/)
    })
  })

  describe("applySecurePaymentValues", () => {
    it("should apply secure payment values successfully", () => {
      const mockValidation = {
        success: true,
        data: {
          validAmount: 10000,
          validInstallments: 1,
        },
        statusCode: 200,
      }

      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue(mockValidation)

      const result = service.applySecurePaymentValues(validCardData)

      expect(result.success).toBe(true)
      expect(result.data?.Payment.Amount).toBe(10000)
      expect(result.data?.Payment.Installments).toBe(1)
      expect(service["paymentValidationService"].validatePaymentValues).toHaveBeenCalledWith(10000, 1)
    })

    it("should return error when payment validation fails", () => {
      const mockValidation = {
        success: false,
        error: "Invalid amount",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }

      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue(mockValidation)

      const result = service.applySecurePaymentValues(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Invalid amount")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
    })

    it("should return error when validation data is missing", () => {
      const mockValidation = {
        success: true,
        data: null,
        statusCode: 200,
      }

      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue(mockValidation)

      const result = service.applySecurePaymentValues(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Erro interno: dados de validação não encontrados")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(500)
    })
  })

  describe("validateCardData", () => {
    it("should validate card data successfully", () => {
      mockBaseValidator.validateAndFormat
        .mockReturnValueOnce({ success: true, data: validCardData.Customer })
        .mockReturnValueOnce({ success: true, data: validCardData.Payment })
        .mockReturnValueOnce({ success: true, data: validCardData.Payment.CreditCard })

      const result = service["validateCardData"](validCardData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(validCardData)
      expect(mockBaseValidator.validateAndFormat).toHaveBeenCalledTimes(3)
    })

    it("should return error when customer validation fails", () => {
      mockBaseValidator.validateAndFormat.mockReturnValueOnce({
        success: false,
        error: "Invalid customer data",
      })

      const result = service["validateCardData"](validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Invalid customer data")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
    })

    it("should return error when payment validation fails", () => {
      mockBaseValidator.validateAndFormat
        .mockReturnValueOnce({ success: true, data: validCardData.Customer })
        .mockReturnValueOnce({
          success: false,
          error: "Invalid payment data",
        })

      const result = service["validateCardData"](validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Invalid payment data")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
    })

    it("should return error when credit card validation fails", () => {
      mockBaseValidator.validateAndFormat
        .mockReturnValueOnce({ success: true, data: validCardData.Customer })
        .mockReturnValueOnce({ success: true, data: validCardData.Payment })
        .mockReturnValueOnce({
          success: false,
          error: "Invalid credit card data",
        })

      const result = service["validateCardData"](validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Invalid credit card data")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
    })
  })

  describe("creditCardPayment", () => {
    beforeEach(() => {
      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue({
        success: true,
        data: { validAmount: 10000, validInstallments: 1 },
        statusCode: 200,
      })

      mockBaseValidator.validateAndFormat.mockReturnValue({ success: true, data: {} })

      service["repository"].creditCardPayment = vi.fn().mockResolvedValue({
        success: true,
        data: validCieloResponse,
        statusCode: 200,
      })
    })

    it("should process credit card payment successfully", async () => {
      const result = await service.creditCardPayment(validCardData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(validCieloResponse)
      expect(service["repository"].creditCardPayment).toHaveBeenCalledTimes(1)
    })

    it("should generate MerchantOrderId when not provided", async () => {
      const { MerchantOrderId, ...cardDataWithoutOrderId } = validCardData
      const testCardData = cardDataWithoutOrderId as ICompleteCardModel

      await service.creditCardPayment(testCardData)

      expect(testCardData.MerchantOrderId).toBeDefined()
      expect(testCardData.MerchantOrderId).toMatch(/^\d{23}$/)
    })

    it("should not generate MerchantOrderId when already provided", async () => {
      const originalOrderId = validCardData.MerchantOrderId

      await service.creditCardPayment(validCardData)

      expect(validCardData.MerchantOrderId).toBe(originalOrderId)
    })

    it("should return error when secure payment values fail", async () => {
      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue({
        success: false,
        error: "Invalid payment values",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      const result = await service.creditCardPayment(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Invalid payment values")
      expect(service["repository"].creditCardPayment).not.toHaveBeenCalled()
    })

    it("should return error when validation fails", async () => {
      mockBaseValidator.validateAndFormat.mockReturnValueOnce({
        success: false,
        error: "Validation failed",
      })

      const result = await service.creditCardPayment(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Validation failed")
      expect(service["repository"].creditCardPayment).not.toHaveBeenCalled()
    })

    it("should return error when repository call fails", async () => {
      service["repository"].creditCardPayment = vi.fn().mockResolvedValue({
        success: false,
        error: "Repository error",
        code: EResponseError.NETWORK_ERROR,
        statusCode: 500,
      })

      const result = await service.creditCardPayment(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Repository error")
      expect(result.code).toBe(EResponseError.NETWORK_ERROR)
    })
  })

  describe("validateCieloResponse", () => {
    it("should validate Cielo response successfully", () => {
      const result = service.validateCieloResponse(validCieloResponse)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(validCieloResponse)
      expect(result.statusCode).toBe(200)
    })

    it("should return error when PaymentId is missing", () => {
      const { PaymentId, ...invalidResponse } = validCieloResponse
      const result = service.validateCieloResponse(invalidResponse as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe("PaymentId é obrigatório na resposta")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
    })

    it("should return error when Status is missing", () => {
      const { Status, ...invalidResponse } = validCieloResponse
      const result = service.validateCieloResponse(invalidResponse as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Status é obrigatório na resposta")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
    })

    it("should return error when ReturnCode is missing", () => {
      const { ReturnCode, ...invalidResponse } = validCieloResponse
      const result = service.validateCieloResponse(invalidResponse as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe("ReturnCode é obrigatório na resposta")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
    })

    it("should return error when ReturnMessage is missing", () => {
      const { ReturnMessage, ...invalidResponse } = validCieloResponse
      const result = service.validateCieloResponse(invalidResponse as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe("ReturnMessage é obrigatório na resposta")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
    })
  })

  describe("processCieloResponse", () => {
    it("should process approved Cielo response successfully", () => {
      const approvedResponse = { ...validCieloResponse, Status: "1" }

      const result = service.processCieloResponse(approvedResponse)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        transactionId: approvedResponse.PaymentId,
        status: "1",
        isApproved: true,
        message: approvedResponse.ReturnMessage,
        authorizationCode: approvedResponse.AuthorizationCode,
      })
      expect(result.statusCode).toBe(200)
      expect(result.code).toBeUndefined()
    })

    it("should process another approved status (Status: 2)", () => {
      const approvedResponse = { ...validCieloResponse, Status: "2" }

      const result = service.processCieloResponse(approvedResponse)

      expect(result.success).toBe(true)
      expect(result.data?.isApproved).toBe(true)
      expect(result.statusCode).toBe(200)
    })

    it("should process rejected Cielo response", () => {
      const rejectedResponse = { ...validCieloResponse, Status: "3" }

      const result = service.processCieloResponse(rejectedResponse)

      expect(result.success).toBe(false)
      expect(result.data).toEqual({
        transactionId: rejectedResponse.PaymentId,
        status: "3",
        isApproved: false,
        message: rejectedResponse.ReturnMessage,
        authorizationCode: rejectedResponse.AuthorizationCode,
      })
      expect(result.statusCode).toBe(400)
      expect(result.code).toBe(EResponseError.PAYMENT_REJECTED)
    })

    it("should return error when Cielo response validation fails", () => {
      const { PaymentId, ...invalidResponse } = validCieloResponse

      const result = service.processCieloResponse(invalidResponse as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe("PaymentId é obrigatório na resposta")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
    })

    it("should handle missing authorization code", () => {
      const { AuthorizationCode, ...responseWithoutAuth } = validCieloResponse

      const result = service.processCieloResponse(responseWithoutAuth as any)

      expect(result.success).toBe(true)
      expect(result.data?.authorizationCode).toBeUndefined()
    })
  })

  describe("Integration Tests", () => {
    it("should handle complete payment flow successfully", async () => {
      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue({
        success: true,
        data: { validAmount: 10000, validInstallments: 1 },
        statusCode: 200,
      })

      mockBaseValidator.validateAndFormat.mockReturnValue({ success: true, data: {} })

      service["repository"].creditCardPayment = vi.fn().mockResolvedValue({
        success: true,
        data: validCieloResponse,
        statusCode: 200,
      })

      const { MerchantOrderId, ...cardDataWithoutOrderId } = validCardData
      const testCardData = cardDataWithoutOrderId as ICompleteCardModel

      const result = await service.creditCardPayment(testCardData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(validCieloResponse)
      expect(testCardData.MerchantOrderId).toBeDefined()
    })

    it("should handle validation errors in payment flow", async () => {
      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue({
        success: false,
        error: "Amount too high",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      const result = await service.creditCardPayment(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Amount too high")
      expect(service["repository"].creditCardPayment).not.toHaveBeenCalled()
    })
  })
})