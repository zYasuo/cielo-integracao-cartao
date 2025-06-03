import { TBrandCard, TCardType } from "@/models/card/card.models";

export type TZeroAuthCardOnFile = "First" | "Used";
export type TZeroAuthCardOnFileReason = "Unscheduled" | "Recurring";
export interface IZeroAuthModel {
  CardType: TCardType;
  CardNumber: string;
  Holder: string;
  ExpirationDate: string;
  SecurityCode: string;
  Brand: TBrandCard;
  CardOnFile: {
    Usage: TZeroAuthCardOnFile;
    Reason: TZeroAuthCardOnFileReason;
  };
}
