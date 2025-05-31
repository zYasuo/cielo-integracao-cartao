import { TIdentificationType } from "@/models/card/card.models";

export interface ICustomerCardModel {
  Name: string;
  Identity: string;
  IdentityType: TIdentificationType;
  Email: string;
  BirthDate: string;
}
