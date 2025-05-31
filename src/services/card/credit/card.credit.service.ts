import type { TResponseApi } from "@/types/response.api.types";
import { EResponseError } from "@/types/enums.types";
import type { ICreditCardApiResponse } from "@/types/response.card.credit.types";
import { SPaymentCardSchema } from "@/validators/card/payment.validator";
import { SCreditCardSchema } from "@/validators/card/credit/card.validator";
import { BaseValidator } from "@/validators/base/base.validator";
import { CreditCardRepository } from "@/repositories/card/credit/card.credit.repositories";
import type { ICompleteCardModel } from "@/models/card/credit/card.credit.models";
import { SCustomerSchema } from "@/validators/card/customer.validator";
import { PaymentValidationService } from "@/services/payment/payment.validation.service";

export class CreditCardService {
  private repository: CreditCardRepository
  private paymentValidationService: PaymentValidationService

  constructor() {
    this.repository = new CreditCardRepository()
    this.paymentValidationService = new PaymentValidationService()
  }

  generateMerchantOrderId(): string {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "")
    const randomSuffix = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")
    return `${timestamp}${randomSuffix}`
  }

  /**
   * Aplica valores seguros para o pagamento
   * Substitui valores potencialmente manipulados com valores seguros do backend
   */
  applySecurePaymentValues(cardData: ICompleteCardModel): TResponseApi<ICompleteCardModel> {
    const { Amount, Installments } = cardData.Payment

    // Valida os valores usando o serviço de validação
    const validation = this.paymentValidationService.validatePaymentValues(Amount, Installments)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code: validation.code,
        statusCode: validation.statusCode,
      }
    }

    // Verifica se validation.data existe antes de usar
    if (!validation.data) {
      return {
        success: false,
        error: "Erro interno: dados de validação não encontrados",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 500,
      }
    }

    // Aplica os valores validados
    const secureCardData: ICompleteCardModel = {
      ...cardData,
      Payment: {
        ...cardData.Payment,
        Amount: validation.data.validAmount,
        Installments: validation.data.validInstallments,
      },
    }

    return {
      success: true,
      data: secureCardData,
      statusCode: 200,
    }
  }

  private validateCardData(cardData: ICompleteCardModel): TResponseApi<ICompleteCardModel> {
    // Validação dos dados do cliente
    const customerValidation = BaseValidator.validateAndFormat(SCustomerSchema, cardData.Customer)
    if (!customerValidation.success) {
      return {
        success: false,
        error: customerValidation.error,
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    // Validação dos dados do cartão de pagamento
    const paymentValidation = BaseValidator.validateAndFormat(SPaymentCardSchema, cardData.Payment)
    if (!paymentValidation.success) {
      return {
        success: false,
        error: paymentValidation.error,
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    // Validação dos dados do cartão de crédito
    const creditCardValidation = BaseValidator.validateAndFormat(SCreditCardSchema, cardData.Payment.CreditCard)
    if (!creditCardValidation.success) {
      return {
        success: false,
        error: creditCardValidation.error,
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    return {
      success: true,
      data: cardData,
      statusCode: 200,
    }
  }

  async creditCardPayment(cardData: ICompleteCardModel): Promise<TResponseApi<ICreditCardApiResponse>> {
    // Gera MerchantOrderId se não fornecido
    if (!cardData.MerchantOrderId) {
      cardData.MerchantOrderId = this.generateMerchantOrderId()
    }

    // Aplica valores seguros para o pagamento
    const secureValues = this.applySecurePaymentValues(cardData)
    if (!secureValues.success) {
      return {
        success: false,
        error: secureValues.error,
        code: secureValues.code,
        statusCode: secureValues.statusCode,
      }
    }

    // Verifica se secureValues.data existe antes de usar
    if (!secureValues.data) {
      return {
        success: false,
        error: "Erro interno: dados seguros não encontrados",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 500,
      }
    }

    // Validação dos dados
    const validation = this.validateCardData(secureValues.data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code: validation.code,
        statusCode: validation.statusCode,
      }
    }

    // Verifica se validation.data existe antes de usar
    if (!validation.data) {
      return {
        success: false,
        error: "Erro interno: dados de validação não encontrados",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 500,
      }
    }

    // Processa o pagamento com o repositório
    const response = await this.repository.creditCardPayment(validation.data)

    return response
  }

  validateCieloResponse(responseData: ICreditCardApiResponse): TResponseApi<ICreditCardApiResponse> {
    if (!responseData.PaymentId) {
      return {
        success: false,
        error: "PaymentId é obrigatório na resposta",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    if (!responseData.Status) {
      return {
        success: false,
        error: "Status é obrigatório na resposta",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    if (!responseData.ReturnCode) {
      return {
        success: false,
        error: "ReturnCode é obrigatório na resposta",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    if (!responseData.ReturnMessage) {
      return {
        success: false,
        error: "ReturnMessage é obrigatório na resposta",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      }
    }

    return {
      success: true,
      data: responseData,
      statusCode: 200,
    }
  }

  processCieloResponse(responseData: ICreditCardApiResponse): TResponseApi<{
    transactionId: string
    status: string
    isApproved: boolean
    message: string
    authorizationCode: string
  }> {
    const validation = this.validateCieloResponse(responseData)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code: validation.code,
        statusCode: validation.statusCode,
      }
    }

    // Verifica se validation.data existe antes de usar
    if (!validation.data) {
      return {
        success: false,
        error: "Erro interno: dados de validação não encontrados",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 500,
      }
    }

    const validatedData = validation.data
    const isApproved = ["1", "2"].includes(validatedData.Status)

    return {
      success: isApproved,
      data: {
        transactionId: validatedData.PaymentId,
        status: validatedData.Status,
        isApproved,
        message: validatedData.ReturnMessage,
        authorizationCode: validatedData.AuthorizationCode,
      },
      statusCode: isApproved ? 200 : 400,
      code: isApproved ? undefined : EResponseError.PAYMENT_REJECTED,
    }
  }
}
