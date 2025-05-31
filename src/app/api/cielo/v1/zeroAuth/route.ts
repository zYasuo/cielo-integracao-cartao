import type { TResponseApi } from "@/types/response.api.types";
import { type NextRequest, NextResponse } from "next/server";
import { ZeroAuthController } from "@/controllers/zeroAuth/zeroAuth.controller";
import type { TZeroAuthApiResponse } from "@/types/response.zeroAuth.types";
import type { IZeroAuthModel } from "@/models/zeroAuth/zeroAuth.models";

/**
 * POST /api/cielo/v1/zero-auth - Realiza a Validação do Cartão antes do Processamento
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<TResponseApi<TZeroAuthApiResponse>>> {
  try {
    const body = await request.json();
    const cardData = body as IZeroAuthModel;

    const controller = new ZeroAuthController();
    const result = await controller.validateZeroAuth(cardData);

    const simpleResponse = {
      isValid: controller.isCardValid(result),
      message: controller.getFriendlyMessage(result),
      success: result.success,
    };

    return NextResponse.json(simpleResponse, {
      status: result.statusCode || 200,
    });
  } catch (error) {
    return NextResponse.json(
      {
        isValid: false,
        message: "Erro interno do servidor",
        success: false,
      },
      { status: 500 }
    );
  }
}
