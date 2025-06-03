import { z } from "zod"
import { EBrandCard } from "@/types/enums.types"
import { CardUtils } from "@/utils/card"

export const SCreditCardSchema = z
  .object({
    CardNumber: z
      .string()
      .min(1, "Card number is required")
      .regex(/^[\d\s-]+$/, "Card number must contain only digits, spaces, or hyphens")
      .transform((value) => CardUtils.cleanCardNumber(value))
      .refine((value) => value.length >= 13 && value.length <= 19, {
        message: "Card number must be between 13-19 digits",
      })
      .refine((value) => CardUtils.isValidLuhn(value), {
        message: "Invalid card number (failed Luhn check)",
      }),

    Holder: z
      .string()
      .min(1, "Holder name is required")
      .max(100, "Holder name is too long")
      .regex(/^[a-zA-Z\s]+$/, "Holder name must contain only letters and spaces")
      .transform((value) => value.trim().toUpperCase()),

    ExpirationDate: z
      .string()
      .min(1, "Expiration date is required")
      .regex(/^(0[1-9]|1[0-2])\/?([0-9]{4})$/, "Expiration date must be in MM/YYYY or MMYYYY format")
      .refine((value) => !CardUtils.isCardExpired(value), {
        message: "Card has expired",
      })
      .transform((value) => CardUtils.normalizeExpirationDate(value)),

    SecurityCode: z
      .string()
      .min(1, "Security code is required")
      .regex(/^\d+$/, "Security code must contain only digits"),

    Brand: z.nativeEnum(EBrandCard, {
      errorMap: () => ({ message: "Brand is required" }),
    }),
  })
  .refine(
    (data) => {
      if (data.Brand === EBrandCard.AMEX) {
        return data.SecurityCode.length === 4
      } else {
        return data.SecurityCode.length === 3
      }
    },
    {
      message: "Security code length must match card brand (3 digits for most cards, 4 for American Express)",
      path: ["SecurityCode"],
    },
  )
  .refine(
    (data) => {
      const detectedBrand = CardUtils.detectCardBrand(data.CardNumber)
      return detectedBrand === data.Brand
    },
    {
      message: "Card brand does not match card number",
      path: ["Brand"],
    },
  )

export type TCreditCardData = z.infer<typeof SCreditCardSchema>

// Schema auxiliar para auto-detectar a bandeira (útil para formulários)
export const SCreditCardAutoDetectSchema = z
  .object({
    CardNumber: z
      .string()
      .min(1, "Card number is required")
      .regex(/^[\d\s-]+$/, "Card number must contain only digits, spaces, or hyphens")
      .transform((value) => CardUtils.cleanCardNumber(value))
      .refine((value) => value.length >= 13 && value.length <= 19, {
        message: "Card number must be between 13-19 digits",
      })
      .refine((value) => CardUtils.isValidLuhn(value), {
        message: "Invalid card number (failed Luhn check)",
      }),

    Holder: z
      .string()
      .min(1, "Holder name is required")
      .max(100, "Holder name is too long")
      .regex(/^[a-zA-Z\s]+$/, "Holder name must contain only letters and spaces")
      .transform((value) => value.trim().toUpperCase()),

    ExpirationDate: z
      .string()
      .min(1, "Expiration date is required")
      .regex(/^(0[1-9]|1[0-2])\/?([0-9]{4})$/, "Expiration date must be in MM/YYYY or MMYYYY format")
      .refine((value) => !CardUtils.isCardExpired(value), {
        message: "Card has expired",
      })
      .transform((value) => CardUtils.normalizeExpirationDate(value)),

    SecurityCode: z
      .string()
      .min(1, "Security code is required")
      .regex(/^\d+$/, "Security code must contain only digits"),
  })
  .refine(
    (data) => {
      const detectedBrand = CardUtils.detectCardBrand(data.CardNumber)

      if (!detectedBrand) {
        return false 
      }

      const expectedLength = detectedBrand === EBrandCard.AMEX ? 4 : 3
      if (data.SecurityCode.length !== expectedLength) {
        return false 
      }

      return true
    },
    {
      message: "Invalid card brand or security code length",
    },
  )
  .transform((data) => {
    const detectedBrand = CardUtils.detectCardBrand(data.CardNumber)!

    return {
      ...data,
      Brand: detectedBrand,
    }
  })

export type TCreditCardAutoDetectData = z.infer<typeof SCreditCardAutoDetectSchema>
