import { describe, it, expect, beforeEach, vi } from "vitest"
import { CreditCardController } from "@/controllers/card/credit/card.credit.controller"
import { CreditCardService } from "@/services/card/credit/card.credit.service"
import { EResponseError, ECardType, ECurrency, ECountry, EIdentificationType, EBrandCard } from "@/types/enums.types"
import type { ICompleteCardModel } from "@/models/card/credit/card.credit.models"
import type { ICreditCardApiResponse } from "@/types/response.card.credit.types"

vi.mock("@/services/card/credit/card.credit.service")

describe("CreditCardController", () => {
  let controller: CreditCardController
  let mockService: any

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

  const processedResponse = {
    transactionId: "12345678-1234-1234-1234-123456789012",
    status: "1",
    isApproved: true,
    message: "Transação aprovada",
    authorizationCode: "123456",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockService = {
      creditCardPayment: vi.fn(),
      validateCieloResponse: vi.fn(),
      processCieloResponse: vi.fn(),
    }
    
    CreditCardService.prototype.creditCardPayment = mockService.creditCardPayment
    CreditCardService.prototype.validateCieloResponse = mockService.validateCieloResponse
    CreditCardService.prototype.processCieloResponse = mockService.processCieloResponse
    
    controller = new CreditCardController()
  })

  describe("processCreditCardPayment", () => {
    it("should process a valid credit card payment", async () => {
      mockService.creditCardPayment.mockResolvedValue({
        success: true,
        data: validCieloResponse,
        statusCode: 200,
      })

      const result = await controller.processCreditCardPayment(validCardData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(validCieloResponse)
      expect(mockService.creditCardPayment).toHaveBeenCalledWith(validCardData)
    })

    it("should return error when card data is null", async () => {
      const result = await controller.processCreditCardPayment(null as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Card data is required")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
      expect(mockService.creditCardPayment).not.toHaveBeenCalled()
    })

    it("should return error when Payment is missing", async () => {
      const { Payment, ...dataWithoutPayment } = validCardData
      const result = await controller.processCreditCardPayment(dataWithoutPayment as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Payment data is required")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
      expect(mockService.creditCardPayment).not.toHaveBeenCalled()
    })

    it("should return error when Customer is missing", async () => {
      const { Customer, ...dataWithoutCustomer } = validCardData
      const result = await controller.processCreditCardPayment(dataWithoutCustomer as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Customer data is required")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
      expect(mockService.creditCardPayment).not.toHaveBeenCalled()
    })

    it("should pass through service validation errors", async () => {
      mockService.creditCardPayment.mockResolvedValue({
        success: false,
        error: "Service validation error",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      const result = await controller.processCreditCardPayment(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Service validation error")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(mockService.creditCardPayment).toHaveBeenCalledWith(validCardData)
    })

    it("should handle network errors from service", async () => {
      mockService.creditCardPayment.mockResolvedValue({
        success: false,
        error: "Network connection failed",
        code: EResponseError.NETWORK_ERROR,
        statusCode: 500,
      })

      const result = await controller.processCreditCardPayment(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Network connection failed")
      expect(result.code).toBe(EResponseError.NETWORK_ERROR)
      expect(mockService.creditCardPayment).toHaveBeenCalledWith(validCardData)
    })

    it("should handle payment rejection from service", async () => {
      mockService.creditCardPayment.mockResolvedValue({
        success: false,
        error: "Payment was rejected",
        code: EResponseError.PAYMENT_REJECTED,
        statusCode: 400,
      })

      const result = await controller.processCreditCardPayment(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Payment was rejected")
      expect(result.code).toBe(EResponseError.PAYMENT_REJECTED)
      expect(mockService.creditCardPayment).toHaveBeenCalledWith(validCardData)
    })
  })

  describe("validateCieloResponse", () => {
    it("should validate a valid Cielo response", () => {
      mockService.validateCieloResponse.mockReturnValue({
        success: true,
        data: validCieloResponse,
        statusCode: 200,
      })

      const result = controller.validateCieloResponse(validCieloResponse)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(validCieloResponse)
      expect(mockService.validateCieloResponse).toHaveBeenCalledWith(validCieloResponse)
    })

    it("should return error when response data is null", () => {
      const result = controller.validateCieloResponse(null as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Response data is required")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
      expect(mockService.validateCieloResponse).not.toHaveBeenCalled()
    })

    it("should pass through service validation errors", () => {
      mockService.validateCieloResponse.mockReturnValue({
        success: false,
        error: "Missing required field",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      const result = controller.validateCieloResponse(validCieloResponse)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Missing required field")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(mockService.validateCieloResponse).toHaveBeenCalledWith(validCieloResponse)
    })

    it("should handle server errors from service", () => {
      mockService.validateCieloResponse.mockReturnValue({
        success: false,
        error: "Internal server error",
        code: EResponseError.SERVER_ERROR,
        statusCode: 500,
      })

      const result = controller.validateCieloResponse(validCieloResponse)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Internal server error")
      expect(result.code).toBe(EResponseError.SERVER_ERROR)
      expect(mockService.validateCieloResponse).toHaveBeenCalledWith(validCieloResponse)
    })
  })

  describe("processCieloResponse", () => {
    it("should process a valid Cielo response", () => {
      mockService.processCieloResponse.mockReturnValue({
        success: true,
        data: processedResponse,
        statusCode: 200,
      })

      const result = controller.processCieloResponse(validCieloResponse)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(processedResponse)
      expect(mockService.processCieloResponse).toHaveBeenCalledWith(validCieloResponse)
    })

    it("should return error when response data is null", () => {
      const result = controller.processCieloResponse(null as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Response data is required")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
      expect(mockService.processCieloResponse).not.toHaveBeenCalled()
    })

    it("should handle payment rejection from service", () => {
      mockService.processCieloResponse.mockReturnValue({
        success: false,
        error: "Payment rejected by issuer",
        code: EResponseError.PAYMENT_REJECTED,
        statusCode: 400,
      })

      const result = controller.processCieloResponse(validCieloResponse)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Payment rejected by issuer")
      expect(result.code).toBe(EResponseError.PAYMENT_REJECTED)
      expect(mockService.processCieloResponse).toHaveBeenCalledWith(validCieloResponse)
    })

    it("should handle server errors from service", () => {
      mockService.processCieloResponse.mockReturnValue({
        success: false,
        error: "Server processing error",
        code: EResponseError.SERVER_ERROR,
        statusCode: 500,
      })

      const result = controller.processCieloResponse(validCieloResponse)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Server processing error")
      expect(result.code).toBe(EResponseError.SERVER_ERROR)
      expect(mockService.processCieloResponse).toHaveBeenCalledWith(validCieloResponse)
    })
  })

  describe("processPaymentComplete", () => {
    it("should process a complete payment flow successfully", async () => {
      mockService.creditCardPayment.mockResolvedValue({
        success: true,
        data: validCieloResponse,
        statusCode: 200,
      })

      mockService.processCieloResponse.mockReturnValue({
        success: true,
        data: processedResponse,
        statusCode: 200,
      })

      const result = await controller.processPaymentComplete(validCardData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(processedResponse)
      expect(mockService.creditCardPayment).toHaveBeenCalledWith(validCardData)
      expect(mockService.processCieloResponse).toHaveBeenCalledWith(validCieloResponse)
    })

    it("should return error when payment processing fails", async () => {
      mockService.creditCardPayment.mockResolvedValue({
        success: false,
        error: "Payment processing failed",
        code: EResponseError.SERVER_ERROR,
        statusCode: 500,
      })

      const result = await controller.processPaymentComplete(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Payment processing failed")
      expect(result.code).toBe(EResponseError.SERVER_ERROR)
      expect(mockService.creditCardPayment).toHaveBeenCalledWith(validCardData)
      expect(mockService.processCieloResponse).not.toHaveBeenCalled()
    })

    it("should return error when card data is invalid", async () => {
      const result = await controller.processPaymentComplete(null as any)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Card data is required")
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.statusCode).toBe(400)
      expect(mockService.creditCardPayment).not.toHaveBeenCalled()
      expect(mockService.processCieloResponse).not.toHaveBeenCalled()
    })

    it("should return error when response processing fails", async () => {
      mockService.creditCardPayment.mockResolvedValue({
        success: true,
        data: validCieloResponse,
        statusCode: 200,
      })

      mockService.processCieloResponse.mockReturnValue({
        success: false,
        error: "Response processing failed",
        code: EResponseError.SERVER_ERROR,
        statusCode: 500,
      })

      const result = await controller.processPaymentComplete(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Response processing failed")
      expect(result.code).toBe(EResponseError.SERVER_ERROR)
      expect(mockService.creditCardPayment).toHaveBeenCalledWith(validCardData)
      expect(mockService.processCieloResponse).toHaveBeenCalledWith(validCieloResponse)
    })

    it("should handle network errors during payment", async () => {
      mockService.creditCardPayment.mockResolvedValue({
        success: false,
        error: "Network timeout",
        code: EResponseError.TIMEOUT_ERROR,
        statusCode: 408,
      })

      const result = await controller.processPaymentComplete(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Network timeout")
      expect(result.code).toBe(EResponseError.TIMEOUT_ERROR)
      expect(mockService.creditCardPayment).toHaveBeenCalledWith(validCardData)
      expect(mockService.processCieloResponse).not.toHaveBeenCalled()
    })

    it("should handle payment rejection in complete flow", async () => {
      mockService.creditCardPayment.mockResolvedValue({
        success: true,
        data: validCieloResponse,
        statusCode: 200,
      })

      mockService.processCieloResponse.mockReturnValue({
        success: false,
        error: "Card declined",
        code: EResponseError.PAYMENT_REJECTED,
        statusCode: 400,
      })

      const result = await controller.processPaymentComplete(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Card declined")
      expect(result.code).toBe(EResponseError.PAYMENT_REJECTED)
      expect(mockService.creditCardPayment).toHaveBeenCalledWith(validCardData)
      expect(mockService.processCieloResponse).toHaveBeenCalledWith(validCieloResponse)
    })

    it("should handle service unavailable errors", async () => {
      mockService.creditCardPayment.mockResolvedValue({
        success: false,
        error: "Payment service unavailable",
        code: EResponseError.SERVICE_UNAVAILABLE,
        statusCode: 503,
      })

      const result = await controller.processPaymentComplete(validCardData)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Payment service unavailable")
      expect(result.code).toBe(EResponseError.SERVICE_UNAVAILABLE)
      expect(mockService.creditCardPayment).toHaveBeenCalledWith(validCardData)
      expect(mockService.processCieloResponse).not.toHaveBeenCalled()
    })
  })
})