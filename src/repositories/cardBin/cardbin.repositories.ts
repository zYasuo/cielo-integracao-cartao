import { CieloConfig } from "@/config/env.config"
import type { ICardBinModel } from "@/models/cardBin/cardBin.models"
import type { TResponseApi } from "@/types/response.api.types"
import { ICardBinResponse } from "@/types/response.cardBin.types"
import { CieloRepositoryBase } from "@/repositories/base/cielo.repository.base"

export class CardBinRepository extends CieloRepositoryBase {

  /**
   * Busca informações do BIN do cartão.
   * @param cardBin - O objeto contendo o BIN do cartão a ser consultado.
   * @returns Uma promessa que resolve com a resposta da API contendo os detalhes do BIN.
   */
  async fetchCardBin(cardBin: ICardBinModel): Promise<TResponseApi<ICardBinResponse>> {
    const url = this.buildUrl(CieloConfig.routes.cardBin, {
      BIN: cardBin.bin,
    })

    return await this.get<ICardBinResponse>(url)
  }
}
