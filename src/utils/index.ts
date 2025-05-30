import { EResponseError } from "@/types/enums.types"

export function HandleErrorResponse(status: number): {
  error: string
  code: EResponseError
  shouldRetry: boolean
} {
  switch (status) {
    case 400:
      return {
        error: "Invalid request format. Please check the card BIN format.",
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
        error: "Card BIN not found or endpoint unavailable. The BIN may not exist in our database.",
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