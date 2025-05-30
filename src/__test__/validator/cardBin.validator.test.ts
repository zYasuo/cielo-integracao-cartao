import { describe, it, expect } from "vitest"
import { BaseValidator } from "@/validators/base/base.validator"
import { SCardBinSchema } from "@/validators/cardBin/cardBin.validator"

describe("CardBin Validators", () => {
  describe("CardBinSchema", () => {
    it("deve validar BIN válido", () => {
      const result = BaseValidator.validate(SCardBinSchema, { bin: "451011" })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ bin: "451011" })
    })

    it("deve rejeitar BIN vazio", () => {
      const result = BaseValidator.validate(SCardBinSchema, { bin: "" })

      expect(result.success).toBe(false)
      expect(result.errors).toContain("bin: BIN is required")
    })

    it("deve rejeitar BIN muito curto", () => {
      const result = BaseValidator.validate(SCardBinSchema, { bin: "4510" })

      expect(result.success).toBe(false)
      expect(result.errors).toContain("bin: BIN must be 6-9 digits")
    })

    it("deve rejeitar BIN muito longo", () => {
      const result = BaseValidator.validate(SCardBinSchema, { bin: "4510112345" })

      expect(result.success).toBe(false)
      expect(result.errors).toContain("bin: BIN must be 6-9 digits")
    })

    it("deve rejeitar BIN com caracteres não numéricos", () => {
      const result = BaseValidator.validate(SCardBinSchema, { bin: "45101a" })

      expect(result.success).toBe(false)
      expect(result.errors).toContain("bin: BIN must be 6-9 digits")
    })

    it("deve rejeitar BINs de teste", () => {
      const result = BaseValidator.validate(SCardBinSchema, { bin: "000000" })

      expect(result.success).toBe(false)
      expect(result.errors).toContain("bin: Test BINs are not allowed")
    })
  })

})
