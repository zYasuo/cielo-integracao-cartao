import { TBrandCard, TCardType } from "@/models/card/card.models";

export interface ICardBinResponse {
  Status: string;
  Provider: TBrandCard;
  CardType: TCardType;
  ForeignCard: boolean;
  CorporateCard: boolean;
  Issuer: string;
  IssuerCode: string;
  Prepaid: boolean;
}

