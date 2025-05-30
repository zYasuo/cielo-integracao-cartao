import type { TResponseApi } from "@/types/response_api.types"
import { EResponseError } from "@/types/enums.types"
import type { ICardBinResponse } from "@/types/response.cardBin.types"
import { SCardBinSchema, SCardNumberSchema } from "@/validators/cardBin/cardBin.validator"
import { BaseValidator } from "@/validators/base/base.validator"
import { CardBinRepository } from "@/repositories/cardBin/cardbin.repositories"
import { ICardBinModel } from "@/models/cardBin/cardBin.models"

export class CardBinService {
  private repository: CardBinRepository

  constructor() {
    this.repository = new CardBinRepository()
  }

  /**
   * Busca informações do BIN do cartão com validação
   */
  async getCardBinInfo(bin: string): Promise<TResponseApi<ICardBinResponse>> {
    // Validação usando Zod
    const validation = BaseValidator.validateAndFormat(SCardBinSchema, { bin })
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }
    const response = await this.repository.fetchCardBin(validation.data as ICardBinModel)

    if (response.success && response.data) {
      const processedData = this.processCardBinData(response.data)
      return {
        ...response,
        data: processedData,
      }
    }

    return response
  }

  /**
   * Extrai o BIN de um número de cartão completo
   */
  extractBinFromCardNumber(cardNumber: string): string | null {
    const validation = BaseValidator.validate(SCardNumberSchema, { cardNumber })
    if (!validation.success) {
      return null
    }

    // Extrai o BIN dos dados validados e limpos
    const cleanNumber = validation.data?.cardNumber.replace(/\D/g, "")

     if (!cleanNumber) {
      return null
    }
    return cleanNumber.substring(0, 6)
  }

  /**
   * Verifica se um cartão é válido para processamento
   */
  async isCardValidForProcessing(bin: string): Promise<TResponseApi<{ isValid: boolean; reason?: string }>> {
    const binResponse = await this.getCardBinInfo(bin)

    if (!binResponse.success || !binResponse.data) {
      return {
        success: false,
        error: binResponse.error || "Failed to fetch card information",
        code: binResponse.code,
        statusCode: binResponse.statusCode,
      }
    }

    const isValid = this.validateCardForProcessing(binResponse.data)

    return {
      success: true,
      data: {
        isValid,
        reason: isValid ? undefined : this.getInvalidReason(binResponse.data),
      },
      statusCode: 200,
    }
  }

  /**
   * Processa e enriquece os dados do BIN
   */
  private processCardBinData(data: ICardBinResponse): ICardBinResponse {
    return {
      ...data,
      Status: data.Status?.toUpperCase() || "UNKNOWN",
    }
  }

  /**
   * Valida se o cartão pode ser processado (regras de negócio)
   */
  private validateCardForProcessing(cardData: ICardBinResponse): boolean {
    // Regra 1: Status deve ser "00" (sucesso)
    if (cardData.Status !== "00") {
      return false
    }

    // Regra 2: Não processar cartões estrangeiros (configurável)
    if (cardData.ForeignCard && !this.allowForeignCards()) {
      return false
    }

    // Regra 3: Verificar se o emissor é válido
    if (!this.isValidIssuer(cardData.Issuer)) {
      return false
    }

    return true
  }

  /**
   * Retorna o motivo pelo qual o cartão é inválido
   */
  private getInvalidReason(cardData: ICardBinResponse): string {
    if (cardData.Status !== "00") {
      return `Invalid card status: ${cardData.Status}`
    }

    if (cardData.ForeignCard && !this.allowForeignCards()) {
      return "Foreign cards are not allowed"
    }

    if (!this.isValidIssuer(cardData.Issuer)) {
      return `Issuer not supported: ${cardData.Issuer}`
    }

    return "Card not valid for processing"
  }

  /**
   * Verifica se cartões estrangeiros são permitidos
   */
  private allowForeignCards(): boolean {
    // Aqui você pode implementar lógica baseada em configuração
    return process.env.ALLOW_FOREIGN_CARDS === "true"
  }

  /**
   * Verifica se o emissor é válido
   */
  private isValidIssuer(issuer: string): boolean {
    const blockedIssuers = ["BLOCKED_BANK", "INVALID_ISSUER"]
    return !blockedIssuers.includes(issuer.toUpperCase())
  }

  /**
   * Busca múltiplos BINs (exemplo de método adicional)
   */
  async getMultipleCardBinInfo(bins: string[]): Promise<TResponseApi<ICardBinResponse[]>> {
    if (bins.length === 0) {
      return {
        success: false,
        error: "At least one BIN is required",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    if (bins.length > 10) {
      return {
        success: false,
        error: "Maximum 10 BINs allowed per request",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    const results: ICardBinResponse[] = []
    const errors: string[] = []

    for (const bin of bins) {
      const result = await this.getCardBinInfo(bin)
      if (result.success && result.data) {
        results.push(result.data)
      } else {
        errors.push(`BIN ${bin}: ${result.error}`)
      }
    }

    if (errors.length > 0 && results.length === 0) {
      return {
        success: false,
        error: errors.join("; "),
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    return {
      success: true,
      data: results,
      statusCode: 200,
    }
  }
}
