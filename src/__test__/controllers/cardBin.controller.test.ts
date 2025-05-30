import { describe, it, expect, vi, beforeEach } from "vitest"
import { EResponseError } from "@/types/enums.types"
import { CardBinService } from "@/services/cardBin/cardBin.service"
import { CardBinController } from "@/controllers/cardBin/cardBin.controller"

vi.mock("@/services/cardBin/cardBin.service")
const MockedCardBinService = CardBinService as any

describe("CardBinController", () => {
  let controller: CardBinController
  let mockService: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockService = {
      getCardBinInfo: vi.fn(),
      extractBinFromCardNumber: vi.fn(),
      isCardValidForProcessing: vi.fn(),
    }

    MockedCardBinService.mockImplementation(() => mockService)

    controller = new CardBinController()
  })

  describe("getCardBinInfo", () => {
    it("deve retornar dados do BIN quando válido", async () => {
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

      mockService.getCardBinInfo.mockResolvedValue({
        success: true,
        data: mockBinData,
        statusCode: 200,
      })

      const result = await controller.getCardBinInfo("451011")

      expect(result).toEqual({
        success: true,
        data: mockBinData,
        statusCode: 200,
      })

      expect(mockService.getCardBinInfo).toHaveBeenCalledWith("451011")
    })

    it("deve retornar erro para BIN vazio", async () => {
      const result = await controller.getCardBinInfo("")

      expect(result).toEqual({
        success: false,
        error: "BIN is required",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      expect(mockService.getCardBinInfo).not.toHaveBeenCalled()
    })

    it("deve retornar erro para BIN com caracteres inválidos", async () => {
      mockService.getCardBinInfo.mockResolvedValue({
        success: false,
        error: "bin: BIN must be 6-9 digits",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      const result = await controller.getCardBinInfo("45101a")

      expect(result).toEqual({
        success: false,
        error: "bin: BIN must be 6-9 digits",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      expect(mockService.getCardBinInfo).toHaveBeenCalledWith("45101a")
    })

    it("deve retornar erro para BIN muito curto", async () => {
      mockService.getCardBinInfo.mockResolvedValue({
        success: false,
        error: "bin: BIN must be 6-9 digits",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      const result = await controller.getCardBinInfo("4510")

      expect(result).toEqual({
        success: false,
        error: "bin: BIN must be 6-9 digits",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      expect(mockService.getCardBinInfo).toHaveBeenCalledWith("4510")
    })

    it("deve retornar erro para BIN muito longo", async () => {
      mockService.getCardBinInfo.mockResolvedValue({
        success: false,
        error: "bin: BIN must be 6-9 digits",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      const result = await controller.getCardBinInfo("4510112345")

      expect(result).toEqual({
        success: false,
        error: "bin: BIN must be 6-9 digits",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      expect(mockService.getCardBinInfo).toHaveBeenCalledWith("4510112345")
    })
  })

  describe("extractBinFromCardNumber", () => {
    it("deve extrair BIN de número de cartão válido", () => {
      mockService.extractBinFromCardNumber.mockReturnValue("451011")

      const result = controller.extractBinFromCardNumber("4510110012341234")

      expect(result).toBe("451011")
      expect(mockService.extractBinFromCardNumber).toHaveBeenCalledWith("4510110012341234")
    })

    it("deve extrair BIN de número com espaços", () => {
      mockService.extractBinFromCardNumber.mockReturnValue("451011")

      const result = controller.extractBinFromCardNumber("4510 1100 1234 1234")

      expect(result).toBe("451011")
      expect(mockService.extractBinFromCardNumber).toHaveBeenCalledWith("4510 1100 1234 1234")
    })

    it("deve extrair BIN de número com hífens", () => {
      mockService.extractBinFromCardNumber.mockReturnValue("451011")

      const result = controller.extractBinFromCardNumber("4510-1100-1234-1234")

      expect(result).toBe("451011")
      expect(mockService.extractBinFromCardNumber).toHaveBeenCalledWith("4510-1100-1234-1234")
    })

    it("deve retornar null para número muito curto", () => {
      mockService.extractBinFromCardNumber.mockReturnValue(null)

      const result = controller.extractBinFromCardNumber("4510")

      expect(result).toBeNull()
      expect(mockService.extractBinFromCardNumber).toHaveBeenCalledWith("4510")
    })

    it("deve retornar null para string vazia", () => {
      const result = controller.extractBinFromCardNumber("")

      expect(result).toBeNull()
      expect(mockService.extractBinFromCardNumber).not.toHaveBeenCalled()
    })
  })

  describe("isCardValidForProcessing", () => {
    it("deve retornar válido para cartão nacional com status 00", async () => {
      mockService.isCardValidForProcessing.mockResolvedValue({
        success: true,
        data: {
          isValid: true,
          reason: undefined,
        },
        statusCode: 200,
      })

      const result = await controller.isCardValidForProcessing("451011")

      expect(result).toEqual({
        success: true,
        data: {
          isValid: true,
          reason: undefined,
        },
        statusCode: 200,
      })

      expect(mockService.isCardValidForProcessing).toHaveBeenCalledWith("451011")
    })

    it("deve retornar inválido para cartão estrangeiro", async () => {
      mockService.isCardValidForProcessing.mockResolvedValue({
        success: true,
        data: {
          isValid: false,
          reason: "Foreign cards are not allowed",
        },
        statusCode: 200,
      })

      const result = await controller.isCardValidForProcessing("451011")

      expect(result).toEqual({
        success: true,
        data: {
          isValid: false,
          reason: "Foreign cards are not allowed",
        },
        statusCode: 200,
      })

      expect(mockService.isCardValidForProcessing).toHaveBeenCalledWith("451011")
    })

    it("deve retornar erro para BIN vazio", async () => {
      const result = await controller.isCardValidForProcessing("")

      expect(result).toEqual({
        success: false,
        error: "BIN is required",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      })

      expect(mockService.isCardValidForProcessing).not.toHaveBeenCalled()
    })

    it("deve propagar erro do service", async () => {
      mockService.isCardValidForProcessing.mockResolvedValue({
        success: false,
        error: "API Error",
        code: EResponseError.SERVER_ERROR,
        statusCode: 500,
      })

      const result = await controller.isCardValidForProcessing("451011")

      expect(result).toEqual({
        success: false,
        error: "API Error",
        code: EResponseError.SERVER_ERROR,
        statusCode: 500,
      })

      expect(mockService.isCardValidForProcessing).toHaveBeenCalledWith("451011")
    })
  })
})