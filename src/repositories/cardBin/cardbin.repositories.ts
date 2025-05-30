import { CieloConfig } from "@/config/env.config"
import type { ICardBinModel } from "@/models/cardBin/cardBin.models"
import type { TResponseApi } from "@/types/response_api.types"
import { ICardBinResponse } from "@/types/response.cardBin.types"
import { CieloRepositoryBase } from "@/repositories/base/cielo.repository.base"

export class CardBinRepository extends CieloRepositoryBase {
  async fetchCardBin(cardBin: ICardBinModel): Promise<TResponseApi<ICardBinResponse>> {
    const url = this.buildUrl(CieloConfig.routes.cardBin, {
      BIN: cardBin.bin,
    })

    return await this.get<ICardBinResponse>(url)
  }
}
