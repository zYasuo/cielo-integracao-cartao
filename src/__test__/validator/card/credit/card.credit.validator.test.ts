import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { SCreditCardSchema, SCreditCardAutoDetectSchema } from "@/validators/card/credit/card.validator"
import { EBrandCard } from "@/types/enums.types"

describe("SCreditCardSchema", () => {
  let originalDate: DateConstructor
  
  beforeAll(() => {
    const mockDate = new Date(2023, 5, 15)
    originalDate = global.Date
    global.Date = class extends Date {
      constructor() {
        super()
        return mockDate
      }
      static now() {
        return mockDate.getTime()
      }
    } as any
  })

  afterAll(() => {
    global.Date = originalDate
  })

  describe("CardNumber validation", () => {
    it("should accept valid card numbers", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.CardNumber).toBe("4111111111111111")
      }
    })

    it("should clean and transform card numbers", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111-1111-1111-1111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.CardNumber).toBe("4111111111111111")
      }
    })

    it("should reject invalid Luhn numbers", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111112",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(false)
    })

    it("should reject card numbers that are too short", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "411111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(false)
    })

    it("should reject card numbers that are too long", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "41111111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(false)
    })
  })

  describe("Holder validation", () => {
    it("should accept valid holder names", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.Holder).toBe("JOHN DOE")
      }
    })

    it("should transform holder names to uppercase", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "john doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.Holder).toBe("JOHN DOE")
      }
    })

    it("should trim whitespace from holder names", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "  John Doe  ",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.Holder).toBe("JOHN DOE")
      }
    })

    it("should reject holder names with non-letter characters", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe 123",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(false)
    })
  })

  describe("ExpirationDate validation", () => {
    it("should accept valid expiration dates in MM/YYYY format", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.ExpirationDate).toBe("12/2025")
      }
    })

    it("should accept valid expiration dates in MMYYYY format", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "122025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.ExpirationDate).toBe("12/2025")
      }
    })

    it("should reject expired cards", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "01/2023",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(false)
    })

    it("should reject invalid month values", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "13/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(false)
    })

    it("should reject invalid date formats", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "2025/12",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(false)
    })
  })

  describe("SecurityCode validation", () => {
    it("should accept valid security codes for Visa (3 digits)", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(true)
    })

    it("should accept valid security codes for Amex (4 digits)", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "378282246310005",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "1234",
        Brand: EBrandCard.AMEX,
      })

      expect(result.success).toBe(true)
    })

    it("should reject security codes with wrong length for Visa", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "1234",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(false)
    })

    it("should reject security codes with wrong length for Amex", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "378282246310005",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.AMEX,
      })

      expect(result.success).toBe(false)
    })

    it("should reject security codes with non-digit characters", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "12A",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(false)
    })
  })

  describe("Brand validation", () => {
    it("should accept matching brand and card number", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      })

      expect(result.success).toBe(true)
    })

    it("should reject mismatched brand and card number", () => {
      const result = SCreditCardSchema.safeParse({
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.MASTERCARD,
      })

      expect(result.success).toBe(false)
    })
  })
})

describe("SCreditCardAutoDetectSchema", () => {
  let originalDate: DateConstructor
  
  beforeAll(() => {
    const mockDate = new Date(2023, 5, 15)
    originalDate = global.Date
    global.Date = class extends Date {
      constructor() {
        super()
        return mockDate
      }
      static now() {
        return mockDate.getTime()
      }
    } as any
  })

  afterAll(() => {
    global.Date = originalDate
  })

  it("should auto-detect Visa brand and validate", () => {
    const result = SCreditCardAutoDetectSchema.safeParse({
      CardNumber: "4111111111111111",
      Holder: "John Doe",
      ExpirationDate: "12/2025",
      SecurityCode: "123",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.Brand).toBe(EBrandCard.VISA)
    }
  })

  it("should auto-detect Mastercard brand and validate", () => {
    const result = SCreditCardAutoDetectSchema.safeParse({
      CardNumber: "5555555555554444",
      Holder: "John Doe",
      ExpirationDate: "12/2025",
      SecurityCode: "123",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.Brand).toBe(EBrandCard.MASTERCARD)
    }
  })

  it("should auto-detect Amex brand and validate 4-digit security code", () => {
    const result = SCreditCardAutoDetectSchema.safeParse({
      CardNumber: "378282246310005",
      Holder: "John Doe",
      ExpirationDate: "12/2025",
      SecurityCode: "1234",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.Brand).toBe(EBrandCard.AMEX)
    }
  })

  it("should reject Amex card with 3-digit security code", () => {
    const result = SCreditCardAutoDetectSchema.safeParse({
      CardNumber: "378282246310005",
      Holder: "John Doe",
      ExpirationDate: "12/2025",
      SecurityCode: "123",
    })

    expect(result.success).toBe(false)
  })

  it("should reject Visa card with 4-digit security code", () => {
    const result = SCreditCardAutoDetectSchema.safeParse({
      CardNumber: "4111111111111111",
      Holder: "John Doe",
      ExpirationDate: "12/2025",
      SecurityCode: "1234",
    })

    expect(result.success).toBe(false)
  })

  it("should reject unrecognized card brands", () => {
    const result = SCreditCardAutoDetectSchema.safeParse({
      CardNumber: "1234567890123456",
      Holder: "John Doe",
      ExpirationDate: "12/2025",
      SecurityCode: "123",
    })

    expect(result.success).toBe(false)
  })
})