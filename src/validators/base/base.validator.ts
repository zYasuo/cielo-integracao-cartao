import { z } from "zod"
import { EResponseError } from "@/types/enums.types"
import type { TResponseApi, TValidationResult } from "@/types/response_api.types"

export class BaseValidator {
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): TValidationResult<T> {
    try {
      const result = schema.parse(data)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
        }
      }
      return {
        success: false,
        errors: ["Unknown validation error"],
      }
    }
  }

  static validateAndFormat<T>(schema: z.ZodSchema<T>, data: unknown): TResponseApi<T> {
    const validation = this.validate(schema, data)

    if (!validation.success) {
      return {
        success: false,
        error: validation.errors?.join(", ") || "Validation failed",
        code: EResponseError.VALIDATION_ERROR,
        statusCode: 400,
        shouldRetry: false,
      }
    }

    return {
      success: true,
      data: validation.data!,
      statusCode: 200,
    }
  }
}
