import type { TResponseApi } from "@/types/response.api.types"
import { EResponseError } from "@/types/enums.types"
import type { ICreditCardApiResponse } from "@/types/response.card.credit.types"
import { CreditCardService } from "@/services/card/credit/card.credit.service"
import type { ICompleteCardModel } from "@/models/card/credit/card.credit.models"

export class CreditCardController {
  private service: CreditCardService

  constructor() {
    this.service = new CreditCardService()
  }

  /**
   * Processa pagamento com cartão de crédito
   */
  async processCreditCardPayment(cardData: ICompleteCardModel): Promise<TResponseApi<ICreditCardApiResponse>> {
    // Validação básica no Controller
    if (!cardData) {
      return {
        success: false,
        error: "Card data is required",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    if (!cardData.Payment) {
      return {
        success: false,
        error: "Payment data is required",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    if (!cardData.Customer) {
      return {
        success: false,
        error: "Customer data is required",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    return await this.service.creditCardPayment(cardData)
  }

  /**
   * Valida resposta da API da Cielo
   */
  validateCieloResponse(responseData: ICreditCardApiResponse): TResponseApi<ICreditCardApiResponse> {
    // Validação básica no Controller
    if (!responseData) {
      return {
        success: false,
        error: "Response data is required",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    return this.service.validateCieloResponse(responseData)
  }

  /**
   * Processa resposta da API da Cielo
   */
  processCieloResponse(responseData: ICreditCardApiResponse): TResponseApi<{
    transactionId: string
    status: string
    isApproved: boolean
    message: string
    authorizationCode: string
  }> {
    // Validação básica no Controller
    if (!responseData) {
      return {
        success: false,
        error: "Response data is required",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    return this.service.processCieloResponse(responseData)
  }

  /**
   * Fluxo completo: processa pagamento e retorna resultado processado
   */
  async processPaymentComplete(cardData: ICompleteCardModel): Promise<
    TResponseApi<{
      transactionId: string
      status: string
      isApproved: boolean
      message: string
      authorizationCode: string
    }>
  > {
    // Processa o pagamento
    const paymentResult = await this.processCreditCardPayment(cardData)

    if (!paymentResult.success || !paymentResult.data) {
      return paymentResult as TResponseApi<any>
    }

    // Processa a resposta
    return this.processCieloResponse(paymentResult.data)
  }
}
