import type { TResponseApi } from "@/types/response.api.types";
import { type NextRequest, NextResponse } from "next/server";
import { CreditCardController } from "@/controllers/card/credit/card.credit.controller";
import type { ICompleteCardModel } from "@/models/card/credit/card.credit.models";
import { ICreditCardApiResponse } from "@/types/response.card.credit.types";

/**
 * POST /api/cielo/v1/credit-card - Processa pagamento com cartão de crédito
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<TResponseApi<ICreditCardApiResponse>>> {
  try {
    const body = await request.json();
    const cardData = body as ICompleteCardModel;

    const controller = new CreditCardController();
    const result = await controller.processCreditCardPayment(cardData);

    return NextResponse.json(result, {
      status: result.statusCode || 200,
    });
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}
