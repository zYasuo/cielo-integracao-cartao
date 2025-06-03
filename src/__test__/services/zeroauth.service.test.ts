import { describe, it, expect, vi, beforeEach } from "vitest";
import { EBrandCard, EResponseError } from "@/types/enums.types";
import {
  ECardType,
  EZeroAuthCardOnFile,
  EZeroAuthCardOnFileReason,
} from "@/types/enums.types";
import { ZeroAuthService } from "@/services/zeroAuth/zeroAuth.service";
import { ZeroAuthRepository } from "@/repositories/zeroAuth/zeroAuth.repositories";

vi.mock("@/repositories/zeroAuth/zeroAuth.repositories");
const MockedZeroAuthRepository = ZeroAuthRepository as any;

describe("ZeroAuthService", () => {
  let service: ZeroAuthService;
  let mockRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepository = {
      zeroAuthValidation: vi.fn(),
    };

    MockedZeroAuthRepository.mockImplementation(() => mockRepository);

    service = new ZeroAuthService();
  });

  describe("validateZeroAuth", () => {
    it("deve validar cartão com sucesso quando dados estão corretos", async () => {
      const mockRepositoryResponse = {
        success: true,
        data: { isValid: true },
        statusCode: 200,
      };

      mockRepository.zeroAuthValidation.mockResolvedValue(
        mockRepositoryResponse
      );

      const result = await service.validateZeroAuth({
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
      });

      expect(result.success).toBe(true);
      expect(mockRepository.zeroAuthValidation).toHaveBeenCalled();
    });

    it("deve rejeitar data de expiração no formato MM/YY", async () => {
      const result = await service.validateZeroAuth({
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
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR);
      expect(result.error).toContain(
        "Expiration date must be in MM/YYYY format"
      );
      expect(mockRepository.zeroAuthValidation).not.toHaveBeenCalled();
    });

    it("deve rejeitar número de cartão inválido", async () => {
      const result = await service.validateZeroAuth({
        CardType: ECardType.CREDIT,
        CardNumber: "123",
        Holder: "Test User",
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR);
      expect(mockRepository.zeroAuthValidation).not.toHaveBeenCalled();
    });

    it("deve rejeitar código de segurança inválido", async () => {
      const result = await service.validateZeroAuth({
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
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR);
      expect(mockRepository.zeroAuthValidation).not.toHaveBeenCalled();
    });

    it("deve rejeitar nome do portador vazio", async () => {
      const result = await service.validateZeroAuth({
        CardType: ECardType.CREDIT,
        CardNumber: "4111111111111111",
        Holder: "", // Vazio
        ExpirationDate: "12/2025",
        SecurityCode: "123",
        Brand: EBrandCard.VISA,
        CardOnFile: {
          Usage: EZeroAuthCardOnFile.FIRST,
          Reason: EZeroAuthCardOnFileReason.UNSCHEDULED,
        },
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe(EResponseError.VALIDATION_ERROR);
      expect(mockRepository.zeroAuthValidation).not.toHaveBeenCalled();
    });
  });
});
