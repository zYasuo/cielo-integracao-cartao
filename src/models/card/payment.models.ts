import {
  TCardType,
  TCountry,
  TCurrency,
  TProvider,
  TSoftDescriptor,
} from "@/models/card/card.models";

export interface IPaymentCardModel {
  Type: TCardType;
  Amount: number;
  Currency: TCurrency;
  Country: TCountry;
  Provider?: TProvider;
  SoftDescriptor?: TSoftDescriptor;
  Installments: number;
}
