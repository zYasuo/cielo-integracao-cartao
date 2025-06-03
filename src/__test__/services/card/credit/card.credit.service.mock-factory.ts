import { ECardType, ECurrency, ECountry, EIdentificationType, EBrandCard } from "@/types/enums.types"
import type { ICompleteCardModel } from "@/models/card/credit/card.credit.models"
import type { ICreditCardApiResponse } from "@/types/response.card.credit.types"

export class CreditCardServiceMockFactory {
  static createValidCardData(overrides?: Partial<ICompleteCardModel>): ICompleteCardModel {
    const defaultData: ICompleteCardModel = {
      MerchantOrderId: "TEST123456789",
      Customer: {
        Name: "John Doe",
        Identity: "12345678901",
        IdentityType: EIdentificationType.CPF,
        Email: "john.doe@example.com",
        BirthDate: "1990-01-01",
      },
      Payment: {
        Type: ECardType.CREDIT,
        Amount: 10000,
        Currency: ECurrency.BRL,
        Country: ECountry.BR,
        Installments: 1,
        CreditCard: {
          CardNumber: "4111111111111111",
          Holder: "JOHN DOE",
          ExpirationDate: "12/2025",
          SecurityCode: "123",
          Brand: EBrandCard.VISA,
        },
      },
    }

    return { ...defaultData, ...overrides }
  }

  static createValidCieloResponse(overrides?: Partial<ICreditCardApiResponse>): ICreditCardApiResponse {
    const defaultResponse: ICreditCardApiResponse = {
      PaymentId: "12345678-1234-1234-1234-123456789012",
      Status: "1",
      ReturnCode: "00",
      ReturnMessage: "Transação aprovada",
      AuthorizationCode: "123456",
      ProofOfSale: "123456",
      Tid: "1234567890123456",
    }

    return { ...defaultResponse, ...overrides }
  }

  static createRejectedCieloResponse(): ICreditCardApiResponse {
    return this.createValidCieloResponse({
      Status: "3",
      ReturnCode: "05",
      ReturnMessage: "Não autorizada",
      AuthorizationCode: "",
    })
  }

  static createInvalidCardData(): Partial<ICompleteCardModel> {
    return {
      Customer: {
        Name: "",
        Identity: "invalid",
        IdentityType: EIdentificationType.CPF,
        Email: "invalid-email",
        BirthDate: "invalid-date",
      },
      Payment: {
        Type: ECardType.CREDIT,
        Amount: -100,
        Currency: ECurrency.BRL,
        Country: ECountry.BR,
        Installments: 15,
        CreditCard: {
          CardNumber: "1234567890123456",
          Holder: "",
          ExpirationDate: "13/2020",
          SecurityCode: "12",
          Brand: EBrandCard.VISA,
        },
      },
    }
  }

  static createExpiredCardData(): ICompleteCardModel {
    return this.createValidCardData({
      Payment: {
        ...this.createValidCardData().Payment,
        CreditCard: {
          ...this.createValidCardData().Payment.CreditCard,
          ExpirationDate: "01/2020",
        },
      },
    })
  }

  static createAmexCardData(): ICompleteCardModel {
    return this.createValidCardData({
      Payment: {
        ...this.createValidCardData().Payment,
        CreditCard: {
          CardNumber: "378282246310005",
          Holder: "JOHN DOE",
          ExpirationDate: "12/2025",
          SecurityCode: "1234",
          Brand: EBrandCard.AMEX,
        },
      },
    })
  }

  static createMastercardData(): ICompleteCardModel {
    return this.createValidCardData({
      Payment: {
        ...this.createValidCardData().Payment,
        CreditCard: {
          CardNumber: "5555555555554444",
          Holder: "JOHN DOE",
          ExpirationDate: "12/2025",
          SecurityCode: "123",
          Brand: EBrandCard.MASTERCARD,
        },
      },
    })
  }
}