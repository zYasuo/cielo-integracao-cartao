import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { SCreditCardSchema } from "@/validators/card/credit/card.validator"
import { SCustomerSchema } from "@/validators/card/customer.validator"
import { SPaymentCardSchema } from "@/validators/card/payment.validator"
import { BaseValidator } from "@/validators/base/base.validator"
import { EBrandCard, ECardType, ECurrency, ECountry, EIdentificationType } from "@/types/enums.types"

describe("Credit Card Integration Tests", () => {
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

  describe("Complete Card Payment Validation", () => {
    it("should validate a complete valid payment", () => {
      const completeCardData = {
        MerchantOrderId: "2023061512345678",
        Customer: {
          Name: "John Doe",
          Identity: "12345678901",
          IdentityType: EIdentificationType.CPF,
          Email: "john.doe@example.com",
          BirthDate: "1990-01-01",
        },
        Payment: {
          Type: ECardType.CREDIT,
          Amount: 10000,
          Currency: ECurrency.BRL,
          Country: ECountry.BR,
          Installments: 1,
          CreditCard: {
            CardNumber: "4111111111111111",
            Holder: "John Doe",
            ExpirationDate: "12/2025",
            SecurityCode: "123",
            Brand: EBrandCard.VISA,
          },
        },
      }

      const customerValidation = BaseValidator.validateAndFormat(SCustomerSchema, completeCardData.Customer)
      expect(customerValidation.success).toBe(true)

      const paymentValidation = BaseValidator.validateAndFormat(SPaymentCardSchema, completeCardData.Payment)
      expect(paymentValidation.success).toBe(true)

      const creditCardValidation = BaseValidator.validateAndFormat(
        SCreditCardSchema,
        completeCardData.Payment.CreditCard,
      )
      expect(creditCardValidation.success).toBe(true)

      if (creditCardValidation.success) {
        expect(creditCardValidation.data?.Holder).toBe("JOHN DOE")
        expect(creditCardValidation.data?.ExpirationDate).toBe("12/2025")
      }
    })

    it("should reject payment with invalid card data", () => {
      const invalidCardData = {
        MerchantOrderId: "2023061512345678",
        Customer: {
          Name: "John Doe",
          Identity: "12345678901",
          IdentityType: EIdentificationType.CPF,
          Email: "john.doe@example.com",
          BirthDate: "1990-01-01",
        },
        Payment: {
          Type: ECardType.CREDIT,
          Amount: 10000,
          Currency: ECurrency.BRL,
          Country: ECountry.BR,
          Installments: 1,
          CreditCard: {
            CardNumber: "4111111111111112",
            Holder: "John Doe",
            ExpirationDate: "12/2025",
            SecurityCode: "123",
            Brand: EBrandCard.VISA,
          },
        },
      }

      const creditCardValidation = BaseValidator.validateAndFormat(
        SCreditCardSchema,
        invalidCardData.Payment.CreditCard,
      )
      expect(creditCardValidation.success).toBe(false)
    })

    it("should reject payment with expired card", () => {
      const expiredCardData = {
        MerchantOrderId: "2023061512345678",
        Customer: {
          Name: "John Doe",
          Identity: "12345678901",
          IdentityType: EIdentificationType.CPF,
          Email: "john.doe@example.com",
          BirthDate: "1990-01-01",
        },
        Payment: {
          Type: ECardType.CREDIT,
          Amount: 10000,
          Currency: ECurrency.BRL,
          Country: ECountry.BR,
          Installments: 1,
          CreditCard: {
            CardNumber: "4111111111111111",
            Holder: "John Doe",
            ExpirationDate: "01/2023",
            SecurityCode: "123",
            Brand: EBrandCard.VISA,
          },
        },
      }

      const creditCardValidation = BaseValidator.validateAndFormat(
        SCreditCardSchema,
        expiredCardData.Payment.CreditCard,
      )
      expect(creditCardValidation.success).toBe(false)
    })

    it("should reject payment with invalid security code", () => {
      const invalidSecurityCodeData = {
        MerchantOrderId: "2023061512345678",
        Customer: {
          Name: "John Doe",
          Identity: "12345678901",
          IdentityType: EIdentificationType.CPF,
          Email: "john.doe@example.com",
          BirthDate: "1990-01-01",
        },
        Payment: {
          Type: ECardType.CREDIT,
          Amount: 10000,
          Currency: ECurrency.BRL,
          Country: ECountry.BR,
          Installments: 1,
          CreditCard: {
            CardNumber: "4111111111111111",
            Holder: "John Doe",
            ExpirationDate: "12/2025",
            SecurityCode: "1234",
            Brand: EBrandCard.VISA,
          },
        },
      }

      const creditCardValidation = BaseValidator.validateAndFormat(
        SCreditCardSchema,
        invalidSecurityCodeData.Payment.CreditCard,
      )
      expect(creditCardValidation.success).toBe(false)
    })

    it("should reject payment with mismatched brand", () => {
      const mismatchedBrandData = {
        MerchantOrderId: "2023061512345678",
        Customer: {
          Name: "John Doe",
          Identity: "12345678901",
          IdentityType: EIdentificationType.CPF,
          Email: "john.doe@example.com",
          BirthDate: "1990-01-01",
        },
        Payment: {
          Type: ECardType.CREDIT,
          Amount: 10000,
          Currency: ECurrency.BRL,
          Country: ECountry.BR,
          Installments: 1,
          CreditCard: {
            CardNumber: "4111111111111111",
            Holder: "John Doe",
            ExpirationDate: "12/2025",
            SecurityCode: "123",
            Brand: EBrandCard.MASTERCARD,
          },
        },
      }

      const creditCardValidation = BaseValidator.validateAndFormat(
        SCreditCardSchema,
        mismatchedBrandData.Payment.CreditCard,
      )
      expect(creditCardValidation.success).toBe(false)
    })
  })
})