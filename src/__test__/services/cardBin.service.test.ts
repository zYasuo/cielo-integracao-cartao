import { describe, it, expect, vi, beforeEach } from "vitest"
import { EResponseError } from "@/types/enums.types"
import { CardBinService } from "@/services/cardBin/cardBin.service"
import { CardBinRepository } from "@/repositories/cardBin/cardbin.repositories"
import { BaseValidator } from "@/validators/base/base.validator"

vi.mock("@/repositories/cardBin/cardBin.repositories", () => ({
  CardBinRepository: vi.fn(),
}))

vi.mock("@/validators/base/base.validator", () => ({
  BaseValidator: {
    validateAndFormat: vi.fn(),
    validate: vi.fn(),
  },
}))

describe("CardBinService", () => {
  let service: CardBinService
  let mockRepository: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockRepository = {
      fetchCardBin: vi.fn(),
      getCachedCardBin: vi.fn(),
      setCachedCardBin: vi.fn(),
    }

    ;(CardBinRepository as any).mockImplementation(() => mockRepository)

    service = new CardBinService()
  })

  describe("getCardBinInfo", () => {
    it("deve retornar dados do BIN quando válido", async () => {
      ;(BaseValidator.validateAndFormat as any).mockReturnValue({
        success: true,
        data: { bin: "451011" },
        statusCode: 200,
      })

      const mockBinData = {
        Status: "00",
        Provider: "VISA",
        CardType: "Creditcard",
        ForeignCard: false,
        CorporateCard: false,
        Issuer: "Test Bank",
        IssuerCode: "123",
        Prepaid: false,
      }

      mockRepository.fetchCardBin.mockResolvedValue({
        success: true,
        data: mockBinData,
        statusCode: 200,
      })

      const result = await service.getCardBinInfo("451011")

      expect(result.success).toBe(true)
      expect(result.data?.Status).toBe("00")
      expect(result.data?.Provider).toBe("VISA")
      expect(mockRepository.fetchCardBin).toHaveBeenCalledWith({ bin: "451011" })
    })

    it("deve retornar erro para BIN inválido", async () => {
      ;(BaseValidator.validateAndFormat as any).mockReturnValue({
        success: false,
        error: "bin: BIN must be 6-9 digits",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      const result = await service.getCardBinInfo("invalid")

      expect(result.success).toBe(false)
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR)
      expect(result.error).toBe("bin: BIN must be 6-9 digits")
      expect(mockRepository.fetchCardBin).not.toHaveBeenCalled()
    })
  })

  describe("extractBinFromCardNumber", () => {
    it("deve extrair BIN de número válido", () => {
      ;(BaseValidator.validate as any).mockReturnValue({
        success: true,
        data: { cardNumber: "4510110012341234" },
      })

      const result = service.extractBinFromCardNumber("4510 1100 1234 1234")

      expect(result).toBe("451011")
    })

    it("deve retornar null para número inválido", () => {
      ;(BaseValidator.validate as any).mockReturnValue({
        success: false,
        errors: ["Invalid card number"],
      })

      const result = service.extractBinFromCardNumber("invalid")

      expect(result).toBeNull()
    })
  })

  describe("isCardValidForProcessing", () => {
    beforeEach(() => {
      ;(BaseValidator.validateAndFormat as any).mockReturnValue({
        success: true,
        data: { bin: "451011" },
        statusCode: 200,
      })
    })

    it("deve retornar válido para cartão nacional com status 00", async () => {
      const mockBinData = {
        Status: "00",
        Provider: "VISA",
        CardType: "Creditcard",
        ForeignCard: false,
        CorporateCard: false,
        Issuer: "Test Bank",
        IssuerCode: "123",
        Prepaid: false,
      }

      mockRepository.fetchCardBin.mockResolvedValue({
        success: true,
        data: mockBinData,
        statusCode: 200,
      })

      const result = await service.isCardValidForProcessing("451011")

      expect(result.success).toBe(true)
      expect(result.data?.isValid).toBe(true)
      expect(result.data?.reason).toBeUndefined()
    })

    it("deve retornar inválido para cartão estrangeiro", async () => {
      const mockBinData = {
        Status: "00",
        Provider: "VISA",
        CardType: "Creditcard",
        ForeignCard: true,
        CorporateCard: false,
        Issuer: "Foreign Bank",
        IssuerCode: "456",
        Prepaid: false,
      }

      mockRepository.fetchCardBin.mockResolvedValue({
        success: true,
        data: mockBinData,
        statusCode: 200,
      })

      const result = await service.isCardValidForProcessing("451011")

      expect(result.success).toBe(true)
      expect(result.data?.isValid).toBe(false)
      expect(result.data?.reason).toBe("Foreign cards are not allowed")
    })
  })

  describe("getMultipleCardBinInfo", () => {
    beforeEach(() => {
      ;(BaseValidator.validateAndFormat as any).mockReturnValue({
        success: true,
        data: { bin: "451011" },
        statusCode: 200,
      })
    })

    it("deve processar múltiplos BINs válidos", async () => {
      const mockBinData = {
        Status: "00",
        Provider: "VISA",
        CardType: "Creditcard",
        ForeignCard: false,
        CorporateCard: false,
        Issuer: "Test Bank",
        IssuerCode: "123",
        Prepaid: false,
      }

      mockRepository.fetchCardBin.mockResolvedValue({
        success: true,
        data: mockBinData,
        statusCode: 200,
      })

      const result = await service.getMultipleCardBinInfo(["451011", "451012"])

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it("deve rejeitar mais de 10 BINs", async () => {
      const bins = Array.from({ length: 11 }, (_, i) => `45101${i}`)
      const result = await service.getMultipleCardBinInfo(bins)

      expect(result.success).toBe(false)
      expect(result.error).toBe("Maximum 10 BINs allowed per request")
    })
  })
})