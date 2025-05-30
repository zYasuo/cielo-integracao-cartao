import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"
import { CieloConfig } from "@/config/env.config"
import { EResponseError } from "@/types/enums.types"
import type { TResponseApi } from "@/types/response_api.types"
import { HandleErrorResponse } from "@/utils"

export abstract class CieloRepositoryBase {
  protected readonly client: AxiosInstance
  protected readonly baseHeaders: Record<string, string>

  constructor() {
    this.baseHeaders = {
      "Content-Type": CieloConfig.headers["Content-Type"],
      Accept: CieloConfig.headers.Accept,
      MerchantId: CieloConfig.headers.MerchantId,
      MerchantKey: CieloConfig.headers.MerchantKey,
    }

    this.client = this.createHttpClient()
  }

  private createHttpClient(): AxiosInstance {
    const client = axios.create({
      timeout: CieloConfig.timeout,
      headers: this.baseHeaders,
    })

    client.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error),
    )

    client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error),
    )

    return client
  }

  protected async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<TResponseApi<T>> {
    try {
      const response = await this.client.get<T>(endpoint, config)
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  protected async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<TResponseApi<T>> {
    try {
      const response = await this.client.post<T>(endpoint, data, config)
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  protected async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<TResponseApi<T>> {
    try {
      const response = await this.client.put<T>(endpoint, data, config)
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  protected async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<TResponseApi<T>> {
    try {
      const response = await this.client.delete<T>(endpoint, config)
      return {
        success: true,
        data: response.data,
        statusCode: response.status,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  private handleError<T>(error: any): TResponseApi<T> {
    if (axios.isAxiosError(error) && error.response) {
      const { status } = error.response
      const errorResponse = HandleErrorResponse(status)

      return {
        success: false,
        error: errorResponse.error,
        code: errorResponse.code,
        statusCode: status,
        shouldRetry: errorResponse.shouldRetry,
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred while communicating with Cielo API.",
      code: EResponseError.UNKNOWN_ERROR,
      shouldRetry: true,
    }
  }

  protected buildUrl(template: string, params: Record<string, string>): string {
    let url = template
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value))
    })
    return url
  }

  protected withHeaders(additionalHeaders: Record<string, string>): AxiosRequestConfig {
    return {
      headers: {
        ...this.baseHeaders,
        ...additionalHeaders,
      },
    }
  }
}
