export type TResponseApi<T> = {
  success: boolean
  data?: T
  error?: string
  code?: string
  statusCode?: number
  shouldRetry?: boolean
}

export interface TValidationResult<T> {
  success: boolean
  data?: T
  errors?: string[]
}
