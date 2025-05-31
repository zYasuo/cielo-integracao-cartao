import { EResponseError } from "@/types/enums.types";
import { TResponseApi } from "@/types/response.api.types";

/**
 * Interface para regras de validação de pagamento
 */
export interface IPaymentValidationRules {
  minAmount: number;
  maxAmount: number;
  maxInstallments: number;
  minInstallmentValue: number;
}

/**
 * Serviço responsável pela validação de valores de pagamento
 */
export class PaymentValidationService {
  /**
   * Obtém as regras de validação de pagamento
   * No futuro, isso consultará um banco de dados para regras específicas
   */
  getPaymentRules(): IPaymentValidationRules {
    // Mock de regras de validação (futuramente virá do banco de dados)
    return {
      minAmount: 100, // R$ 1,00 (em centavos)
      maxAmount: 1000000, // R$ 10.000,00 (em centavos)
      maxInstallments: 12,
      minInstallmentValue: 1000, // R$ 10,00 (em centavos)
    };
  }

  /**
   * Valida o valor do pagamento
   */
  validateAmount(amount: number): TResponseApi<number> {
    const rules = this.getPaymentRules();

    if (amount < rules.minAmount) {
      return {
        success: false,
        error: `Valor mínimo para pagamento é R$ ${(
          rules.minAmount / 100
        ).toFixed(2)}`,
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      };
    }

    if (amount > rules.maxAmount) {
      return {
        success: false,
        error: `Valor máximo para pagamento é R$ ${(
          rules.maxAmount / 100
        ).toFixed(2)}`,
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      };
    }

    return {
      success: true,
      data: amount,
      statusCode: 200,
    };
  }

  /**
   * Calcula o número máximo de parcelas permitido para um valor
   */
  calculateMaxInstallments(amount: number): number {
    const rules = this.getPaymentRules();
    return Math.min(
      Math.floor(amount / rules.minInstallmentValue),
      rules.maxInstallments
    );
  }

  /**
   * Valida o número de parcelas para um valor específico
   */
  validateInstallments(
    amount: number,
    installments: number
  ): TResponseApi<number> {
    if (installments < 1) {
      return {
        success: false,
        error: "Número de parcelas deve ser pelo menos 1",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      };
    }

    const maxAllowedInstallments = this.calculateMaxInstallments(amount);

    if (installments > maxAllowedInstallments) {
      return {
        success: false,
        error: `Para o valor de R$ ${(amount / 100).toFixed(
          2
        )}, o máximo de parcelas permitido é ${maxAllowedInstallments}`,
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      };
    }

    return {
      success: true,
      data: installments,
      statusCode: 200,
    };
  }

  /**
   * Valida o valor e número de parcelas do pagamento
   */
  validatePaymentValues(
    amount: number,
    installments: number
  ): TResponseApi<{
    validAmount: number;
    validInstallments: number;
  }> {
    // Valida o valor
    const amountValidation = this.validateAmount(amount);
    if (!amountValidation.success) {
      return {
        success: false,
        error: amountValidation.error,
        code: amountValidation.code,
        statusCode: amountValidation.statusCode,
      };
    }

    // Verifica se amountValidation.data existe
    if (amountValidation.data === undefined) {
      return {
        success: false,
        error: "Erro interno: valor validado não encontrado",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 500,
      };
    }

    // Valida as parcelas
    const installmentsValidation = this.validateInstallments(
      amount,
      installments
    );
    if (!installmentsValidation.success) {
      return {
        success: false,
        error: installmentsValidation.error,
        code: installmentsValidation.code,
        statusCode: installmentsValidation.statusCode,
      };
    }

    // Verifica se installmentsValidation.data existe
    if (installmentsValidation.data === undefined) {
      return {
        success: false,
        error: "Erro interno: parcelas validadas não encontradas",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 500,
      };
    }

    // Retorna os valores validados
    return {
      success: true,
      data: {
        validAmount: amountValidation.data,
        validInstallments: installmentsValidation.data,
      },
      statusCode: 200,
    };
  }
}
