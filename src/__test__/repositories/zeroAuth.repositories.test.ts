import { describe, it, expect, vi, beforeEach } from "vitest"
import { ZeroAuthRepository } from "@/repositories/zeroAuth/zeroAuth.repositories"
import type { IZeroAuthModel } from "@/models/zeroAuth/zeroAuth.models"
import type { IZeroAuthResponse } from "@/types/response.zeroAuth.types"
import { isZeroAuthSuccessResponse } from "@/utils"

vi.mock("@/repositories/zeroAuth/zeroAuth.repositories")
const MockedZeroAuthRepository = ZeroAuthRepository as any

describe("ZeroAuthRepository", () => {
  let repository: ZeroAuthRepository
  let mockZeroAuthValidation: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockZeroAuthValidation = vi.fn()

    MockedZeroAuthRepository.mockImplementation(() => ({
      zeroAuthValidation: mockZeroAuthValidation,
    }))

    repository = new ZeroAuthRepository()
  })

  describe("zeroAuthValidation", () => {
    const mockZeroAuthData: IZeroAuthModel = {
      CardType: "Creditcard",
      CardNumber: "4111111111111111",
      Holder: "Test User",
      ExpirationDate: "12/2025",
      SecurityCode: "123",
      Brand: "VISA",
    }

    it("deve chamar zeroAuthValidation com os parâmetros corretos", async () => {
      const mockResponse = {
        success: true,
        data: {
          Valid: true,
          ReturnCode: "00",
          ReturnMessage: "Transacao autorizada",
          IssuerTransactionId: "580027442382078",
        } as IZeroAuthResponse,
        statusCode: 200,
      }

      mockZeroAuthValidation.mockResolvedValue(mockResponse)

      const result = await repository.zeroAuthValidation(mockZeroAuthData)

      expect(mockZeroAuthValidation).toHaveBeenCalledWith(mockZeroAuthData)
      expect(result).toEqual(mockResponse)
    })

    describe("Cenários de Sucesso", () => {
      it("deve retornar resposta de sucesso quando cartão é válido", async () => {
        const mockResponse = {
          success: true,
          data: {
            Valid: true,
            ReturnCode: "00",
            ReturnMessage: "Transacao autorizada",
            IssuerTransactionId: "580027442382078",
          } as IZeroAuthResponse,
          statusCode: 200,
        }

        mockZeroAuthValidation.mockResolvedValue(mockResponse)

        const result = await repository.zeroAuthValidation(mockZeroAuthData)

        expect(result).toEqual(mockResponse)
        expect(result.success).toBe(true)

        if (result.data && isZeroAuthSuccessResponse(result.data)) {
          expect(result.data.Valid).toBe(true)
          expect(result.data.ReturnCode).toBe("00")
          expect(result.data.ReturnMessage).toBe("Transacao autorizada")
          expect(result.data.IssuerTransactionId).toBe("580027442382078")
        } else {
          expect(false).toBe(true)
        }

        expect(result.statusCode).toBe(200)
      })
    })
  })
})