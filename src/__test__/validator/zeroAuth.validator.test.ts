import { describe, it, expect } from "vitest"
import { SZeroAuthSchema } from "@/validators/zeroAuth/zeroAuth.validator"
import { ECardType, EBrandCard, EZeroAuthCardOnFile, EZeroAuthCardOnFileReason } from "@/types/enums.types"

describe("SZeroAuthSchema", () => {
  describe("ExpirationDate validation", () => {
    it("deve aceitar data no formato MM/YYYY", () => {
      const dadosValidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosValidos)
      expect(result.success).toBe(true)
    })

    it("deve rejeitar data no formato MM/YY", () => {
      const dadosInvalidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/25",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)

      if (!result.success) {
        const expirationError = result.error.issues.find((issue) => issue.path.includes("ExpirationDate"))
        expect(expirationError?.message).toBe("Expiration date must be in MM/YYYY format")
      }
    })

    it("deve rejeitar mês inválido", () => {
      const dadosInvalidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "13/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })

    it("deve aceitar data sem barra", () => {
      const dadosValidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "122025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosValidos)
      expect(result.success).toBe(true)
    })
  })

  describe("CardNumber validation", () => {
    it("deve aceitar número de cartão válido", () => {
      const dadosValidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111 1111 1111 1111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosValidos)
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.CardNumber).toBe("4111111111111111")
      }
    })

    it("deve rejeitar número muito curto", () => {
      const dadosInvalidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "123456789012",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })

    it("deve rejeitar número muito longo", () => {
      const dadosInvalidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "12345678901234567890",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })
  })

  describe("SecurityCode validation", () => {
    it("deve aceitar código de 3 dígitos", () => {
      const dadosValidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosValidos)
      expect(result.success).toBe(true)
    })

    it("deve rejeitar código com menos de 3 dígitos", () => {
      const dadosInvalidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "12",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })

    it("deve rejeitar código com mais de 4 dígitos", () => {
      const dadosInvalidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "12345",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })

    it("deve rejeitar código com caracteres não numéricos", () => {
      const dadosInvalidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "12a",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })
  })

  describe("CardOnFile validation", () => {
    it("deve aceitar combinação FIRST + UNSCHEDULED", () => {
      const dadosValidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosValidos)
      expect(result.success).toBe(true)
    })

    it("deve aceitar combinação USED + RECURRING", () => {
      const dadosValidos = {
        CardType: ECardType.DEBIT,
        CardNumber: "5555555555554444",
        Holder: "Test User",
        ExpirationDate: "06/2026",
        SecurityCode: "456",
        Brand: EBrandCard.MASTERCARD,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.USED,
          Reason: EZeroAuthCardOnFileReason.RECURRING,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosValidos)
      expect(result.success).toBe(true)
    })

    it("deve rejeitar combinação FIRST + RECURRING", () => {
      const dadosInvalidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.RECURRING,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)

      if (!result.success) {
        const cardOnFileError = result.error.issues.find((issue) => issue.path.includes("CardOnFile"))
        expect(cardOnFileError?.message).toBe("Card on file usage and reason do not match")
      }
    })

    it("deve rejeitar combinação USED + UNSCHEDULED", () => {
      const dadosInvalidos = {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.USED,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })
  })
})