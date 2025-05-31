"use server";

import { CardBinController } from "@/controllers/cardBin/cardBin.controller";
import type { ICardBinResponse } from "@/types/response.cardBin.types";
import type { TResponseApi } from "@/types/response.api.types";

/**
 * Ação para buscar informações do BIN do cartão
 * @param ABin - O BIN do cartão a ser consultado
 * @return Promise<TResponseApi<ICardBinResponse>> - Resposta com as informações do BIN ou erro
 **/
export async function FetchCardBinAction(
  bin: string
): Promise<TResponseApi<ICardBinResponse>> {
  const controller = new CardBinController();
  return await controller.getCardBinInfo(bin);
}

/**
 * Ação para validar se um cartão pode ser processado
 * @param ABin - O BIN do cartão a ser validado
 * @return Promise<TResponseApi<{ isValid: boolean; reason?: string }>> - Resposta com a validade do cartão e motivo, se inválido
 */
export async function ValidateCardForProcessingAction(
  ABin: string
): Promise<TResponseApi<{ isValid: boolean; reason?: string }>> {
  const controller = new CardBinController();
  return await controller.isCardValidForProcessing(ABin);
}

/**
 * Ação para extrair o BIN de um número de cartão completo
 * @param cardNumber - O número do cartão de crédito ou débito
 * @return Promise<TResponseApi<{ bin: string | null }>> - Resposta com o BIN extraído ou null se inválido
 */
export async function ExtractBinFromCardNumberAction(
  cardNumber: string
): Promise<TResponseApi<{ bin: string | null }>> {
  const controller = new CardBinController();
  const bin = controller.extractBinFromCardNumber(cardNumber);

  return {
    success: true,
    data: { bin },
    statusCode: 200,
  };
}
