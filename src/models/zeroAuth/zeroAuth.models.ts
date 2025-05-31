import { TBrandCard, TCardType } from "@/models/card/card.models"
export interface IZeroAuthModel {
  CardType: TCardType; 
  CardNumber: string; 
  Holder: string;
  ExpirationDate: string;
  SecurityCode: string;
  Brand: TBrandCard;
}