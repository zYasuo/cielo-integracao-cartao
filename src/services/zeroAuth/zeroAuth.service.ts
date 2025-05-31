import type { TResponseApi } from "@/types/response.api.types";
import { EResponseError } from "@/types/enums.types";
import { TZeroAuthApiResponse } from "@/types/response.zeroAuth.types";
import { SZeroAuthSchema } from "@/validators/zeroAuth/zeroAuth.validator";
import { BaseValidator } from "@/validators/base/base.validator";
import { ZeroAuthRepository } from "@/repositories/zeroAuth/zeroAuth.repositories";
import { IZeroAuthModel } from "@/models/zeroAuth/zeroAuth.models";

export class ZeroAuthService {
  private repository: ZeroAuthRepository;

  constructor() {
    this.repository = new ZeroAuthRepository();
  }

  /**
   * Valida os dados do cartão usando o serviço ZeroAuth
   */
  async validateZeroAuth(
    zeroAuthData: IZeroAuthModel
  ): Promise<TResponseApi<TZeroAuthApiResponse>> {
    // Validação usando Zod
    const validation = BaseValidator.validateAndFormat(
      SZeroAuthSchema,
      zeroAuthData
    );
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      };
    }

    const response = await this.repository.zeroAuthValidation(
      validation.data as IZeroAuthModel
    );

    return response;
  }
}
