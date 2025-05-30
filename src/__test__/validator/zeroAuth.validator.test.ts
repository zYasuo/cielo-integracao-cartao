import { describe, it, expect } from "vitest";
import { BaseValidator } from "@/validators/base/base.validator";
import { SZeroAuthSchema } from "@/validators/zeroAuth/zeroAuth.validator";
import { EBrandCard, ECardType } from "@/types/enums.types";

describe("ZeroAuth Validators", () => {
  describe("SZeroAuthSchema", () => {
    it("should validate valid ZeroAuth data", () => {
      const result = BaseValidator.validate(SZeroAuthSchema, {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      });
    });

    it("should reject empty CardType", () => {
      const result = BaseValidator.validate(SZeroAuthSchema, {
        CardType: "",
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain("CardType: Card type is required");
    });

    it("should reject invalid CardNumber format", () => {
      const result = BaseValidator.validate(SZeroAuthSchema, {
        CardType: ECardType.CREDIT,
        CardNumber: "invalid_card_number",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        "CardNumber: Card number must contain only digits, spaces, or hyphens"
      );
    });

    it("should reject empty Holder", () => {
      const result = BaseValidator.validate(SZeroAuthSchema, {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Holder: Holder name is required");
    });

    it("should reject invalid ExpirationDate format", () => {
      const result = BaseValidator.validate(SZeroAuthSchema, {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "invalid_date",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        "ExpirationDate: Expiration date must be in MM/YYYY format"
      );
    });

  it("should reject empty SecurityCode", () => {
  const result = BaseValidator.validate(SZeroAuthSchema, {
    CardType: ECardType.CREDIT,
    CardNumber: "4111111111111111",
    Holder: "John Doe",
    ExpirationDate: "12/2025",
    SecurityCode: "",
    Brand: EBrandCard.VISA,
  });

  expect(result.success).toBe(false);
  expect(result.errors).toContain("SecurityCode: Security code is required");
});

    it("should reject invalid SecurityCode format", () => {
      const result = BaseValidator.validate(SZeroAuthSchema, {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "",
        Brand: EBrandCard.VISA,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        "SecurityCode: Security code is required"
      );
    });

    it("should reject invalid SecurityCode format", () => {
      const result = BaseValidator.validate(SZeroAuthSchema, {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "12a",
        Brand: EBrandCard.VISA,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        "SecurityCode: Security code must contain only digits"
      );
    });

    it("should reject empty Brand", () => {
      const result = BaseValidator.validate(SZeroAuthSchema, {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: "",
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Brand: Brand is required");
    });
    it("should reject invalid Brand", () => {
      const result = BaseValidator.validate(SZeroAuthSchema, {
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "John Doe",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: "InvalidBrand",
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        "Brand: Brand is required"
      );
    });
  });
});
