import {
  EBrandCard,
  ECardType,
  EZeroAuthCardOnFile,
  EZeroAuthCardOnFileReason,
} from "@/types/enums.types";
import { z } from "zod";

export const SZeroAuthSchema = z.object({
  CardType: z.nativeEnum(ECardType, {
    errorMap: () => ({ message: "Card type is required" }),
  }),
  CardNumber: z
    .string()
    .min(1, "Card number is required")
    .regex(
      /^[\d\s-]+$/,
      "Card number must contain only digits, spaces, or hyphens"
    )
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length >= 13 && value.length <= 19, {
      message: "Card number must be between 13-19 digits",
    }),
  Holder: z.string().min(1, "Holder name is required"),
  ExpirationDate: z
    .string()
    .min(1, "Expiration date is required")
    .regex(
      /^(0[1-9]|1[0-2])\/?([0-9]{4})$/,
      "Expiration date must be in MM/YYYY format"
    ),
  SecurityCode: z
  .string()
  .min(3, "Security code must be at least 3 digits")
  .regex(/^\d+$/, "Security code must contain only digits")
  .refine((value) => value.length === 3 || value.length === 4, {
    message: "Security code must be 3 or 4 digits"
  }),
  Brand: z.nativeEnum(EBrandCard, {
    errorMap: () => ({ message: "Brand is required" }),
  }),
  CardOnFile: z
    .object({
      Usage: z.nativeEnum(EZeroAuthCardOnFile, {
        errorMap: () => ({ message: "Card on file usage is required" }),
      }),
      Reason: z.nativeEnum(EZeroAuthCardOnFileReason, {
        errorMap: () => ({ message: "Card on file reason is required" }),
      }),
    })
    .refine(
      (data) => {
        if (
          data.Usage === EZeroAuthCardOnFile.FIRST &&
          data.Reason !== EZeroAuthCardOnFileReason.UNSCHEDULED
        ) {
          return false;
        }
        if (
          data.Usage === EZeroAuthCardOnFile.USED &&
          data.Reason !== EZeroAuthCardOnFileReason.RECURRING
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Card on file usage and reason do not match",
      }
    ),
});

export type TZeroAuthData = z.infer<typeof SZeroAuthSchema>;
