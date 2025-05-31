import { CieloConfig } from "@/config/env.config";
import { IZeroAuthModel } from "@/models/zeroAuth/zeroAuth.models";
import type { TResponseApi } from "@/types/response.api.types";
import { CieloRepositoryBase } from "@/repositories/base/cielo.repository.base";
import { TZeroAuthApiResponse } from "@/types/response.zeroAuth.types";

export class ZeroAuthRepository extends CieloRepositoryBase {

  /**
   * Valida um cartão de crédito usando o ZeroAuth.
   * @param zeroAuth - O objeto contendo os detalhes do cartão a ser validado.
   * @returns Uma promessa que resolve com a resposta da API contendo os detalhes da validação.
   */
  async zeroAuthValidation(
    zeroAuth: IZeroAuthModel
  ): Promise<TResponseApi<TZeroAuthApiResponse>> {
    const url = this.buildUrl(CieloConfig.routes.zeroAuth, {
      CardType: zeroAuth.CardType,
      CardNumber: zeroAuth.CardNumber,
      Holder: zeroAuth.Holder,
      ExpirationDate: zeroAuth.ExpirationDate,
      SecurityCode: zeroAuth.SecurityCode,
      Brand: zeroAuth.Brand,
    });
    return await this.post<TZeroAuthApiResponse>(url, zeroAuth);
  }
}
