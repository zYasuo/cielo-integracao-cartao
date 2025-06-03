import { describe, it, expect, beforeEach, vi } from "vitest"
import { CreditCardService } from "@/services/card/credit/card.credit.service"
import { BaseValidator } from "@/validators/base/base.validator"
import { EResponseError, ECardType, ECurrency, ECountry, EIdentificationType, EBrandCard } from "@/types/enums.types"
import type { ICompleteCardModel } from "@/models/card/credit/card.credit.models"
import type { ICreditCardApiResponse } from "@/types/response.card.credit.types"

vi.mock("@/repositories/card/credit/card.credit.repositories")
vi.mock("@/services/payment/payment.validation.service")
vi.mock("@/validators/base/base.validator")

describe("CreditCardService Integration Tests", () => {
  let service: CreditCardService

  const createValidCardData = (): ICompleteCardModel => ({
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
  })

  const createValidCieloResponse = (): ICreditCardApiResponse => ({
    PaymentId: "12345678-1234-1234-1234-123456789012",
    Status: "1",
    ReturnCode: "00",
    ReturnMessage: "Transação aprovada",
    AuthorizationCode: "123456",
    ProofOfSale: "123456",
    Tid: "1234567890123456",
  })

  beforeEach(() => {
    vi.clearAllMocks()
    service = new CreditCardService()
  })

  describe("End-to-End Payment Processing", () => {
    it("should process a complete payment flow with all validations", async () => {
      const cardData = createValidCardData()
      const mockCieloResponse = createValidCieloResponse()

      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue({
        success: true,
        data: { validAmount: 10000, validInstallments: 1 },
        statusCode: 200,
      })

      const mockBaseValidator = vi.mocked(BaseValidator)
      mockBaseValidator.validateAndFormat.mockReturnValue({
        success: true,
        data: {},
      })

      service["repository"].creditCardPayment = vi.fn().mockResolvedValue({
        success: true,
        data: mockCieloResponse,
        statusCode: 200,
      })

      const result = await service.creditCardPayment(cardData)

      expect(result.success).toBe(true)
      expect(cardData.MerchantOrderId).toBeDefined()
      expect(service["paymentValidationService"].validatePaymentValues).toHaveBeenCalledWith(10000, 1)
      expect(service["repository"].creditCardPayment).toHaveBeenCalledTimes(1)
    })

    it("should handle payment rejection from Cielo", async () => {
      const cardData = createValidCardData()
      const mockRejectedResponse: ICreditCardApiResponse = {
        ...createValidCieloResponse(),
        Status: "3",
        ReturnCode: "05",
        ReturnMessage: "Não autorizada",
        AuthorizationCode: "",
      }

      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue({
        success: true,
        data: { validAmount: 10000, validInstallments: 1 },
        statusCode: 200,
      })

      const mockBaseValidator = vi.mocked(BaseValidator)
      mockBaseValidator.validateAndFormat.mockReturnValue({
        success: true,
        data: {},
      })

      service["repository"].creditCardPayment = vi.fn().mockResolvedValue({
        success: true,
        data: mockRejectedResponse,
        statusCode: 200,
      })

      const result = await service.creditCardPayment(cardData)

      expect(result.success).toBe(true)
      expect(result.data?.Status).toBe("3")

      const processedResult = service.processCieloResponse(result.data!)

      expect(processedResult.success).toBe(false)
      expect(processedResult.data?.isApproved).toBe(false)
      expect(processedResult.code).toBe(EResponseError.PAYMENT_REJECTED)
    })

    it("should handle network/API errors", async () => {
      const cardData = createValidCardData()

      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue({
        success: true,
        data: { validAmount: 10000, validInstallments: 1 },
        statusCode: 200,
      })

      const mockBaseValidator = vi.mocked(BaseValidator)
      mockBaseValidator.validateAndFormat.mockReturnValue({
        success: true,
        data: {},
      })

      service["repository"].creditCardPayment = vi.fn().mockResolvedValue({
        success: false,
        error: "Network error",
        code: EResponseError.NETWORK_ERROR,
        statusCode: 500,
      })

      const result = await service.creditCardPayment(cardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Network error")
      expect(result.code).toBe(EResponseError.NETWORK_ERROR)
    })
  })

  describe("Business Logic Validation", () => {
    it("should reject payments with invalid amounts", async () => {
      const cardData = createValidCardData()
      cardData.Payment.Amount = -100

      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue({
        success: false,
        error: "Amount must be positive",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      const result = await service.creditCardPayment(cardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Amount must be positive")
      expect(service["repository"].creditCardPayment).not.toHaveBeenCalled()
    })

    it("should reject payments with invalid installments", async () => {
      const cardData = createValidCardData()
      cardData.Payment.Installments = 15

      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue({
        success: false,
        error: "Maximum 12 installments allowed",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      const result = await service.creditCardPayment(cardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Maximum 12 installments allowed")
      expect(service["repository"].creditCardPayment).not.toHaveBeenCalled()
    })
  })

  describe("Response Processing", () => {
    it("should correctly identify approved transactions", () => {
      const approvedStatuses = ["1", "2"]

      approvedStatuses.forEach((status) => {
        const response: ICreditCardApiResponse = {
          PaymentId: "test-id",
          Status: status,
          ReturnCode: "00",
          ReturnMessage: "Approved",
          AuthorizationCode: "123456",
          ProofOfSale: "123456",
          Tid: "1234567890123456",
        }

        const result = service.processCieloResponse(response)

        expect(result.success).toBe(true)
        expect(result.data?.isApproved).toBe(true)
        expect(result.statusCode).toBe(200)
        expect(result.code).toBeUndefined()
      })
    })

    it("should correctly identify rejected transactions", () => {
      const rejectedStatuses = ["0", "3", "4", "5", "10", "11", "12", "13", "20"]

      rejectedStatuses.forEach((status) => {
        const response: ICreditCardApiResponse = {
          PaymentId: "test-id",
          Status: status,
          ReturnCode: "05",
          ReturnMessage: "Not authorized",
          AuthorizationCode: "",
          ProofOfSale: "123456",
          Tid: "1234567890123456",
        }

        const result = service.processCieloResponse(response)

        expect(result.success).toBe(false)
        expect(result.data?.isApproved).toBe(false)
        expect(result.statusCode).toBe(400)
        expect(result.code).toBe(EResponseError.PAYMENT_REJECTED)
      })
    })
  })

  describe("Error Handling", () => {
    it("should handle malformed Cielo responses gracefully", () => {
      const malformedResponses = [
        {},
        { PaymentId: "test" },
        { Status: "1" },
      ]

      malformedResponses.forEach((response) => {
        const result = service.validateCieloResponse(response as any)

        expect(result.success).toBe(false)
        expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
        expect(result.statusCode).toBe(400)
      })
    })

    it("should handle null responses", () => {
      expect(() => {
        service.validateCieloResponse(null as any)
      }).toThrow()
    })

    it("should handle internal validation errors", async () => {
      const cardData = createValidCardData()

      service["paymentValidationService"].validatePaymentValues = vi.fn().mockReturnValue({
        success: true,
        data: null,
        statusCode: 200,
      })

      const result = await service.creditCardPayment(cardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Erro interno: dados de validação não encontrados")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(500)
    })
  })
})