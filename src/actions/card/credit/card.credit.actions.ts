"use server";

import { CreditCardController } from "@/controllers/card/credit/card.credit.controller";
import type { TResponseApi } from "@/types/response.api.types";
import type { ICompleteCardModel } from "@/models/card/credit/card.credit.models";
import type { ICreditCardApiResponse } from "@/types/response.card.credit.types";

/**
 * Função para processar pagamento com cartão de crédito
 * @param cardData - Dados completos do cartão e cliente
 * @return Promise<TResponseApi<ICreditCardApiResponse & { isApproved?: boolean }>> - Resposta com o resultado do pagamento
 */
export async function ProcessCreditCardPaymentAction(
  cardData: ICompleteCardModel
): Promise<TResponseApi<ICreditCardApiResponse & { isApproved?: boolean }>> {
  const controller = new CreditCardController();
  const result = await controller.processCreditCardPayment(cardData);

  // Adicionar a propriedade isApproved para facilitar o uso no cliente
  if (result.success && result.data) {
    const isApproved = ["1", "2"].includes(result.data.Status);

    return {
      ...result,
      data: {
        ...result.data,
        isApproved,
      },
    };
  }

  return result;
}

/**
 * Função para processar pagamento completo com resposta formatada
 * @param cardData - Dados completos do cartão e cliente
 * @return Promise<TResponseApi<ProcessedPaymentResult>> - Resposta processada e formatada
 */
export async function ProcessPaymentCompleteAction(
  cardData: ICompleteCardModel
): Promise<
  TResponseApi<{
    transactionId: string;
    status: string;
    isApproved: boolean;
    message: string;
    authorizationCode: string;
  }>
> {
  const controller = new CreditCardController();
  return await controller.processPaymentComplete(cardData);
}
