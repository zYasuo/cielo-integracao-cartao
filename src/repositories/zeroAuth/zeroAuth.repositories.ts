import { CieloConfig } from "@/config/env.config";
import { IZeroAuthModel } from "@/models/zeroAuth/zeroAuth.models";
import type { TResponseApi } from "@/types/response_api.types";
import { CieloRepositoryBase } from "@/repositories/base/cielo.repository.base";
import { TZeroAuthApiResponse } from "@/types/response.zeroAuth.types";

export class ZeroAuthRepository extends CieloRepositoryBase {
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
