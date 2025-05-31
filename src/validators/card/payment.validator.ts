import z from "zod";
import { ECardType, ECurrency, ECountry } from "@/types/enums.types";

export const SPaymentCardSchema = z.object({
  Type: z.nativeEnum(ECardType, {
    errorMap: () => ({ message: "Card type is required" }),
  }),
  Amount: z.number().min(1, "Amount must be greater than 0"),
  Currency: z.nativeEnum(ECurrency, {
    errorMap: () => ({ message: "Currency is required" }),
  }),
  Country: z.nativeEnum(ECountry, {
    errorMap: () => ({ message: "Country is required" }),
  }),
  Provider: z.string().optional(),
  SoftDescriptor: z.string().optional(),
  Installments: z.number().min(1, "Installments must be at least 1").max(12, "Installments must be at most 12").default(1),
});

export type TPaymentCardData = z.infer<typeof SPaymentCardSchema>;
