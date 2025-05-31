import { CieloConfig } from "@/config/env.config";
import { CieloRepositoryBase } from "@/repositories/base/cielo.repository.base";
import { ICreditCardApiResponse } from "@/types/response.card.credit.types";
import { ICompleteCardModel } from "@/models/card/credit/card.credit.models";
import type { TResponseApi } from "@/types/response.api.types";

export class CreditCardRepository extends CieloRepositoryBase {
  /**
   * Processa o pagamento com cartão de crédito.
   * @param card - O objeto contendo os detalhes do cartão de crédito a ser processado.
   * @returns Uma promessa que resolve com a resposta da API contendo os detalhes do pagamento.
   */

  async creditCardPayment(
    card: ICompleteCardModel
  ): Promise<TResponseApi<ICreditCardApiResponse>> {
    const url = CieloConfig.routes.creditCard;
    return await this.post<ICreditCardApiResponse>(url, card);
  }
}
