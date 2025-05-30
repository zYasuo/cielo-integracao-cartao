import { describe, it, expect } from "vitest"
import { SZeroAuthSchema } from "@/validators/zeroAuth/zeroAuth.validator"

describe("SZeroAuthSchema", () => {
  describe("ExpirationDate validation", () => {
    it("deve aceitar data no formato MM/YYYY", () => {
      const dadosValidos = {
        CardType: "Creditcard",
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: "VISA",
      }

      const result = SZeroAuthSchema.safeParse(dadosValidos)
      expect(result.success).toBe(true)
    })

    it("deve rejeitar data no formato MM/YY", () => {
      const dadosInvalidos = {
        CardType: "Creditcard",
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/25", 
        SecurityCode: "123",
        Brand: "VISA",
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Expiration date must be in MM/YYYY format")
      }
    })

    it("deve rejeitar mês inválido", () => {
      const dadosInvalidos = {
        CardType: "Creditcard",
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "13/2025", // Mês inválido
        SecurityCode: "123",
        Brand: "VISA",
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })

    it("deve aceitar data sem barra", () => {
      const dadosValidos = {
        CardType: "Creditcard",
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "122025", // Sem barra
        SecurityCode: "123",
        Brand: "VISA",
      }

      const result = SZeroAuthSchema.safeParse(dadosValidos)
      expect(result.success).toBe(true)
    })
  })

  describe("CardNumber validation", () => {
    it("deve aceitar número de cartão válido", () => {
      const dadosValidos = {
        CardType: "Creditcard",
        CardNumber: "4111 1111 1111 1111", // Com espaços
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: "VISA",
      }

      const result = SZeroAuthSchema.safeParse(dadosValidos)
      expect(result.success).toBe(true)

      if (result.success) {
        // Verifica se os espaços foram removidos
        expect(result.data.CardNumber).toBe("4111111111111111")
      }
    })

    it("deve rejeitar número muito curto", () => {
      const dadosInvalidos = {
        CardType: "Creditcard",
        CardNumber: "123456789012", // 12 dígitos (muito curto)
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: "VISA",
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })

    it("deve rejeitar número muito longo", () => {
      const dadosInvalidos = {
        CardType: "Creditcard",
        CardNumber: "12345678901234567890", // 20 dígitos (muito longo)
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: "VISA",
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })
  })

  describe("SecurityCode validation", () => {
    it("deve aceitar código de 3 dígitos", () => {
      const dadosValidos = {
        CardType: "Creditcard",
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: "VISA",
      }

      const result = SZeroAuthSchema.safeParse(dadosValidos)
      expect(result.success).toBe(true)
    })

    it("deve rejeitar código com menos de 3 dígitos", () => {
      const dadosInvalidos = {
        CardType: "Creditcard",
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "12", // Muito curto
        Brand: "VISA",
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })

    it("deve rejeitar código com mais de 3 dígitos", () => {
      const dadosInvalidos = {
        CardType: "Creditcard",
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "1234", // Muito longo
        Brand: "VISA",
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })

    it("deve rejeitar código com caracteres não numéricos", () => {
      const dadosInvalidos = {
        CardType: "Creditcard",
        CardNumber: "4111111111111111",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "12a", // Contém letra
        Brand: "VISA",
      }

      const result = SZeroAuthSchema.safeParse(dadosInvalidos)
      expect(result.success).toBe(false)
    })
  })
})
