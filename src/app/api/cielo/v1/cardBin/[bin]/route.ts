import { CardBinController } from "@/controllers/cardBin/cardBin.controller"
import type { ICardBinResponse } from "@/types/response.cardBin.types"
import type { TResponseApi } from "@/types/response_api.types"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/card-bin/[bin] - Buscar informações do BIN do cartão
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { bin: string } },
): Promise<NextResponse<TResponseApi<ICardBinResponse>>> {
  try {
    const { bin } = params

    if (!bin) {
      return NextResponse.json(
        {
          success: false,
          error: "BIN é obrigatório",
          statusCode: 400,
        },
        { status: 400 },
      )
    }

    const controller = new CardBinController()
    const result = await controller.getCardBinInfo(bin)

    return NextResponse.json(result, {
      status: result.statusCode || 200,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        statusCode: 500,
      },
      { status: 500 },
    )
  }
}
