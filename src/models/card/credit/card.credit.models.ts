import { IPaymentCardModel } from "@/models/card/payment.models";
import { TBrandCard } from "@/models/card/card.models";
import { ICustomerCardModel } from "@/models/card/customer.models";

export interface ICreditCardModel {
  CardNumber: string;
  Holder: string;
  ExpirationDate: string;
  SecurityCode: string;
  Brand: TBrandCard;
}

export interface ICompleteCardModel {
  MerchantOrderId: string;
  Customer: ICustomerCardModel;
  Payment: IPaymentCardModel & {
    CreditCard: ICreditCardModel;
  };
}

