import { z } from "zod"

export const SCardBinSchema = z.object({
  bin: z
    .string()
    .min(1, "BIN is required")
    .regex(/^\d{6,9}$/, "BIN must be 6-9 digits")
    .refine((bin) => !["000000", "111111", "123456"].includes(bin), {
      message: "Test BINs are not allowed",
    }),
})

export const SCardNumberSchema = z.object({
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .regex(/^[\d\s-]+$/, "Card number must contain only digits, spaces, or hyphens")
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length >= 13 && value.length <= 19, {
      message: "Card number must be between 13-19 digits",
    }),
})



export type TCardBinInput = z.infer<typeof SCardBinSchema>
export type TCardNumberInput = z.infer<typeof SCardNumberSchema>
