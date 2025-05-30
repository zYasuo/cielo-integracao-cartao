import type { TResponseApi } from "@/types/response_api.types"
import { EResponseError } from "@/types/enums.types"
import { CardBinRepository } from "@/repositories/cardBin/cardbin.repositories"
import { ICardBinResponse } from "@/types/response.cardBin.types"
import { CardBinService } from "@/services/cardBin/cardBin.service"

export class CardBinController {
  private service: CardBinService 

  constructor() {
    this.service = new CardBinService()
  }

  /**
   * Busca informações do BIN do cartão
   */
  async getCardBinInfo(bin: string): Promise<TResponseApi<ICardBinResponse>> {
    // Validação do BIN
    if (!bin) {
      return {
        success: false,
        error: "BIN is required",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }
    return await this.service.getCardBinInfo(bin)
  }


/**
   * Extrai o BIN de um número de cartão completo
   */
  extractBinFromCardNumber(cardNumber: string): string | null {
    if (!cardNumber) {
      return null
    }

    return this.service.extractBinFromCardNumber(cardNumber)
  }

  /**
   * Verifica se um cartão é válido para processamento
   */
 async isCardValidForProcessing(bin: string): Promise<TResponseApi<{ isValid: boolean; reason?: string }>> {
    // ✅ Validação básica no Controller
    if (!bin) {
      return {
        success: false,
        error: "BIN is required",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    return await this.service.isCardValidForProcessing(bin)
  }
}
