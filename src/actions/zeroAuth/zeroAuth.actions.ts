"use server";
import { ZeroAuthController } from "@/controllers/zeroAuth/zeroAuth.controller";
import type { TResponseApi } from "@/types/response.api.types";
import { IZeroAuthModel } from "@/models/zeroAuth/zeroAuth.models";
import { TZeroAuthApiResponse } from "@/types/response.zeroAuth.types";

/**
 * Função para validar os dados do cartão usando o serviço ZeroAuth
 * @param zeroAuthData - Dados do cartão a serem validados
 * @return Promise<TResponseApi<TZeroAuthApiResponse>> - Resposta com o resultado da validação
 */
export async function ValidateZeroAuthAction(
  zeroAuthData: IZeroAuthModel
): Promise<TResponseApi<TZeroAuthApiResponse & { isValid?: boolean }>> {
  const controller = new ZeroAuthController();
  const result = await controller.validateZeroAuth(zeroAuthData);

  // Adicionar a propriedade isValid para facilitar o uso no cliente
  if (result.success && result.data) {
    return {
      ...result,
      data: {
        ...result.data,
        isValid: controller.isCardValid(result),
      },
    };
  }

  return result;
}
