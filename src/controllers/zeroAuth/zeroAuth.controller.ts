import type { TResponseApi } from "@/types/response.api.types";
import { EResponseError } from "@/types/enums.types";
import type { TZeroAuthApiResponse } from "@/types/response.zeroAuth.types";
import { ZeroAuthService } from "@/services/zeroAuth/zeroAuth.service";
import { IZeroAuthModel } from "@/models/zeroAuth/zeroAuth.models";
import { isZeroAuthErrorResponse, isZeroAuthSuccessResponse } from "@/utils";

export class ZeroAuthController {
  private service: ZeroAuthService;

  constructor() {
    this.service = new ZeroAuthService();
  }

  /**
   * Valida os dados do cartão usando o serviço ZeroAuth
   */
  async validateZeroAuth(
    zeroAuthData: IZeroAuthModel
  ): Promise<TResponseApi<TZeroAuthApiResponse>> {
    // Validação básica no Controller
    if (!zeroAuthData) {
      return {
        success: false,
        error: "Card data is required",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
      };
    }

    return await this.service.validateZeroAuth(zeroAuthData);
  }

  /**
   * Verifica se o cartão é válido com base na resposta da API
   * Método auxiliar para facilitar o uso da resposta
   */
  isCardValid(response: TResponseApi<TZeroAuthApiResponse>): boolean {
    if (!response.success || !response.data) {
      return false;
    }

    // Se for resposta padrão, verifica Valid
    if (isZeroAuthSuccessResponse(response.data)) {
      return response.data.Valid;
    }

    // Se for resposta de erro, sempre é inválido
    return false;
  }

  getFriendlyMessage(response: TResponseApi<TZeroAuthApiResponse>): string {
    if (!response.success) {
      return response.error || "Erro na validação do cartão";
    }

    if (!response.data) {
      return "Resposta inválida da API";
    }

    // Se for resposta padrão
    if (isZeroAuthSuccessResponse(response.data)) {
      return response.data.Valid
        ? "Cartão válido"
        : `Cartão inválido: ${response.data.ReturnMessage}`;
    }

    // Se for resposta de erro
    if (isZeroAuthErrorResponse(response.data)) {
      return `Erro: ${response.data.Message}`;
    }

    return "Resposta desconhecida da API";
  }
}
