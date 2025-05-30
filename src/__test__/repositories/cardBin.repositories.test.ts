import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";
import axios from "axios";
import { EResponseError } from "@/types/enums.types";
import { CardBinRepository } from "@/repositories/cardBin/cardbin.repositories";

vi.mock("axios");
const mockedAxios = axios as any;

vi.mock("@/utils", () => ({
  HandleErrorResponse: vi.fn((status: number) => ({
    error: `Error ${status}`,
    code: EResponseError.UNKNOWN_ERROR,
    shouldRetry: false,
  })),
}));

describe("CardBinRepository", () => {
  let repository: CardBinRepository;
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };

    mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);
    mockedAxios.isAxiosError = vi.fn();

    repository = new CardBinRepository();
  });

  describe("fetchCardBin", () => {
    it("deve retornar dados do BIN com sucesso", async () => {
      const mockBinData = {
        Status: "00",
        Provider: "VISA",
        CardType: "Creditcard",
        ForeignCard: false,
        CorporateCard: false,
        Issuer: "Test Bank",
        IssuerCode: "123",
        Prepaid: false,
      };

      const mockResponse = {
        data: mockBinData,
        status: 200,
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await repository.fetchCardBin({ bin: "451011" });

      expect(result).toEqual({
        success: true,
        data: mockBinData,
        statusCode: 200,
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });

    it("deve tratar erro da API corretamente", async () => {
      const mockError = {
        response: {
          status: 404,
        },
      };

      mockAxiosInstance.get.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result = await repository.fetchCardBin({ bin: "451011" });

      expect(result).toEqual({
        success: false,
        error: "Error 404",
        code: EResponseError.UNKNOWN_ERROR,
        statusCode: 404,
        shouldRetry: false,
      });
    });

    it("deve tratar erro desconhecido", async () => {
      const mockError = new Error("Network error");
      mockAxiosInstance.get.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(false);

      const result = await repository.fetchCardBin({ bin: "451011" });

      expect(result).toEqual({
        success: false,
        error:
          "An unexpected error occurred while communicating with Cielo API.",
        code: EResponseError.UNKNOWN_ERROR,
        shouldRetry: true,
      });
    });
  });
});