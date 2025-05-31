import { z } from "zod";
import { EBrandCard } from "@/types/enums.types";

export const SCreditCardSchema = z.object({
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
    .min(3, "Security code is required")
    .max(3, "Security code must be 3")
    .regex(/^\d+$/, "Security code must contain only digits"),
  Brand: z.nativeEnum(EBrandCard, {
    errorMap: () => ({ message: "Brand is required" }),
  }),
});

export type TCreditCardData = z.infer<typeof SCreditCardSchema>;
