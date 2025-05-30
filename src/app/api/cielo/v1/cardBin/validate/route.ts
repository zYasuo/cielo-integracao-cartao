import { CardBinController } from "@/controllers/cardBin/cardBin.controller"
import type { TResponseApi } from "@/types/response_api.types"
import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/card-bin/extract - Extrair BIN de um número de cartão completo
 */
export async function POST(request: NextRequest): Promise<NextResponse<TResponseApi<{ bin: string | null }>>> {
  try {
    const body = await request.json()
    const { cardNumber } = body

    if (!cardNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Número do cartão é obrigatório",
          statusCode: 400,
        },
        { status: 400 },
      )
    }

    const controller = new CardBinController()
    const bin = controller.extractBinFromCardNumber(cardNumber)

    return NextResponse.json(
      {
        success: true,
        data: { bin },
        statusCode: 200,
      },
      { status: 200 },
    )
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
