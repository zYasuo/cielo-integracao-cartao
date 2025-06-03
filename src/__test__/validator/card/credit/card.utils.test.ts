import { describe, it, expect } from "vitest"
import { EBrandCard } from "@/types/enums.types"
import { CardUtils } from "@/utils/card"

describe("CardUtils", () => {
  describe("isValidLuhn", () => {
    it("should validate valid card numbers", () => {
      expect(CardUtils.isValidLuhn("4111111111111111")).toBe(true)
      expect(CardUtils.isValidLuhn("5555555555554444")).toBe(true)
      expect(CardUtils.isValidLuhn("378282246310005")).toBe(true)
      expect(CardUtils.isValidLuhn("6011111111111117")).toBe(true)
    })

    it("should reject invalid card numbers", () => {
      expect(CardUtils.isValidLuhn("4111111111111112")).toBe(false)
      expect(CardUtils.isValidLuhn("1234567890123456")).toBe(false)
    })

    it("should handle empty strings", () => {
      expect(CardUtils.isValidLuhn("")).toBe(true)
    })
  })

  describe("detectCardBrand", () => {
    it("should detect Visa cards", () => {
      expect(CardUtils.detectCardBrand("4111111111111111")).toBe(EBrandCard.VISA)
      expect(CardUtils.detectCardBrand("4242424242424242")).toBe(EBrandCard.VISA)
      expect(CardUtils.detectCardBrand("4000056655665556")).toBe(EBrandCard.VISA)
    })

    it("should detect Mastercard cards", () => {
      expect(CardUtils.detectCardBrand("5555555555554444")).toBe(EBrandCard.MASTERCARD)
      expect(CardUtils.detectCardBrand("5105105105105100")).toBe(EBrandCard.MASTERCARD)
      expect(CardUtils.detectCardBrand("2221001234567890")).toBe(EBrandCard.MASTERCARD)
    })

    it("should detect American Express cards", () => {
      expect(CardUtils.detectCardBrand("378282246310005")).toBe(EBrandCard.AMEX)
      expect(CardUtils.detectCardBrand("371449635398431")).toBe(EBrandCard.AMEX)
    })

    it("should detect Elo cards", () => {
      expect(CardUtils.detectCardBrand("4011111111111111")).toBe(EBrandCard.ELO)
      expect(CardUtils.detectCardBrand("5041111111111111")).toBe(EBrandCard.ELO)
      expect(CardUtils.detectCardBrand("6362111111111111")).toBe(EBrandCard.ELO)
    })

    it("should detect Hipercard cards", () => {
      expect(CardUtils.detectCardBrand("6062821234567890")).toBe(EBrandCard.HIPERCARD)
    })

    it("should return null for unknown card types", () => {
      expect(CardUtils.detectCardBrand("1234567890123456")).toBe(null)
      expect(CardUtils.detectCardBrand("9876543210987654")).toBe(null)
    })

    it("should handle cards with spaces and hyphens", () => {
      expect(CardUtils.detectCardBrand("4111-1111-1111-1111")).toBe(EBrandCard.VISA)
      expect(CardUtils.detectCardBrand("5555 5555 5555 4444")).toBe(EBrandCard.MASTERCARD)
    })
  })

  describe("formatCardNumber", () => {
    it("should format card numbers with spaces every 4 digits", () => {
      expect(CardUtils.formatCardNumber("4111111111111111")).toBe("4111 1111 1111 1111")
      expect(CardUtils.formatCardNumber("378282246310005")).toBe("3782 8224 6310 005")
    })

    it("should clean non-digit characters before formatting", () => {
      expect(CardUtils.formatCardNumber("4111-1111-1111-1111")).toBe("4111 1111 1111 1111")
      expect(CardUtils.formatCardNumber("5555 5555 5555 4444")).toBe("5555 5555 5555 4444")
    })
  })

  describe("maskCardNumber", () => {
    it("should mask all but the last 4 digits", () => {
      expect(CardUtils.maskCardNumber("4111111111111111")).toBe("****-****-****-1111")
      expect(CardUtils.maskCardNumber("378282246310005")).toBe("****-****-****-0005")
    })

    it("should handle short card numbers", () => {
      expect(CardUtils.maskCardNumber("123")).toBe("123")
    })
  })

  describe("cleanCardNumber", () => {
    it("should remove all non-digit characters", () => {
      expect(CardUtils.cleanCardNumber("4111-1111-1111-1111")).toBe("4111111111111111")
      expect(CardUtils.cleanCardNumber("5555 5555 5555 4444")).toBe("5555555555554444")
      expect(CardUtils.cleanCardNumber("3782 82246 31000 5")).toBe("378282246310005")
    })
  })

  describe("isCardExpired", () => {
    it("should identify expired cards", () => {
      const mockDate = new Date(2023, 5, 15)
      const originalDate = global.Date
      global.Date = class extends Date {
        constructor() {
          super()
          return mockDate
        }
        static now() {
          return mockDate.getTime()
        }
      } as any

      expect(CardUtils.isCardExpired("01/2023")).toBe(true)
      expect(CardUtils.isCardExpired("05/2023")).toBe(true)
      expect(CardUtils.isCardExpired("06/2023")).toBe(false)
      expect(CardUtils.isCardExpired("07/2023")).toBe(false)
      expect(CardUtils.isCardExpired("01/2024")).toBe(false)

      global.Date = originalDate
    })

    it("should handle dates without slashes", () => {
      const mockDate = new Date(2023, 5, 15)
      const originalDate = global.Date
      global.Date = class extends Date {
        constructor() {
          super()
          return mockDate
        }
        static now() {
          return mockDate.getTime()
        }
      } as any

      expect(CardUtils.isCardExpired("012023")).toBe(true)
      expect(CardUtils.isCardExpired("062023")).toBe(false)
      expect(CardUtils.isCardExpired("012024")).toBe(false)

      global.Date = originalDate
    })
  })

  describe("normalizeExpirationDate", () => {
    it("should format dates to MM/YYYY format", () => {
      expect(CardUtils.normalizeExpirationDate("01/2023")).toBe("01/2023")
      expect(CardUtils.normalizeExpirationDate("012023")).toBe("01/2023")
    })

    it("should handle single-digit months", () => {
      expect(CardUtils.normalizeExpirationDate("12023")).toBe("01/2023")
    })
  })
})