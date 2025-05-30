import { EResponseError } from "@/types/enums.types"
import { IZeroAuthErrorResponse, IZeroAuthResponse, TZeroAuthApiResponse } from "@/types/response.zeroAuth.types"

export function HandleErrorResponse(status: number): {
  error: string
  code: EResponseError
  shouldRetry: boolean
} {
  switch (status) {
    case 400:
      return {
        error: "Invalid request. Please check your input parameters.",
        code: EResponseError.BAD_REQUEST,
        shouldRetry: false,
      }

    case 401:
      return {
        error: "Authentication failed. Please verify your merchant credentials.",
        code: EResponseError.AUTHENTICATION_ERROR,
        shouldRetry: false,
      }

    case 403:
      return {
        error: "Access forbidden. Your IP may not be authorized for this merchant account.",
        code: EResponseError.FORBIDDEN_ERROR,
        shouldRetry: false,
      }

    case 404:
      return {
        error: "Resource not found. Please check the requested endpoint or parameters.",
        code: EResponseError.NOT_FOUND_ERROR,
        shouldRetry: false,
      }

    case 405:
      return {
        error: "HTTP method not allowed. Please contact support.",
        code: EResponseError.METHOD_NOT_ALLOWED,
        shouldRetry: false,
      }

    case 500:
      return {
        error: "Internal server error. Please try again in a few moments.",
        code: EResponseError.SERVER_ERROR,
        shouldRetry: true,
      }

    case 502:
      return {
        error: "Bad gateway error. The payment service may be temporarily unavailable.",
        code: EResponseError.SERVER_ERROR,
        shouldRetry: true,
      }

    case 503:
      return {
        error: "Service temporarily unavailable. Please try again later.",
        code: EResponseError.SERVICE_UNAVAILABLE,
        shouldRetry: true,
      }

    default:
      return {
        error: `Unexpected HTTP status: ${status}`,
        code: EResponseError.UNKNOWN_ERROR,
        shouldRetry: status >= 500,
      }
  }
}


export function isZeroAuthErrorResponse(response: TZeroAuthApiResponse): response is IZeroAuthErrorResponse {
  return 'Code' in response && 'Message' in response;
}

export function isZeroAuthSuccessResponse(response: TZeroAuthApiResponse): response is IZeroAuthResponse {
  return 'Valid' in response && 'ReturnCode' in response;
}
