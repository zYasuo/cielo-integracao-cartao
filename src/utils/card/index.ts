import { EBrandCard } from "@/types/enums.types"

export class CardUtils {
  /**
   * Valida número de cartão usando algoritmo de Luhn
   */
  static isValidLuhn(cardNumber: string): boolean {
    let sum = 0
    let isEven = false

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(cardNumber[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  /**
   * Detecta a bandeira do cartão baseada no número
   */
  static detectCardBrand(cardNumber: string): EBrandCard | null {
    const cleanNumber = cardNumber.replace(/\D/g, "")

    // Elo: deve vir antes do Visa para evitar conflitos
    if (/^(4011|4312|4389|4514|4573|5041|5066|5067|6277|6362|6363|6504|6505|6516)/.test(cleanNumber)) {
      return EBrandCard.ELO
    }

    // Visa: começa com 4 (mas não os ranges do Elo)
    if (/^4/.test(cleanNumber)) {
      return EBrandCard.VISA
    }

    // Mastercard: 5[1-5] ou 2[2-7]
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
      return EBrandCard.MASTERCARD
    }

    // American Express: 34 ou 37
    if (/^3[47]/.test(cleanNumber)) {
      return EBrandCard.AMEX
    }

    // Hipercard: 606282
    if (/^606282/.test(cleanNumber)) {
      return EBrandCard.HIPERCARD
    }

    return null
  }

  /**
   * Formata número do cartão com espaços
   */
  static formatCardNumber(cardNumber: string): string {
    const clean = cardNumber.replace(/\D/g, "")
    return clean.replace(/(.{4})/g, "$1 ").trim()
  }

  /**
   * Mascara número do cartão para exibição segura
   */
  static maskCardNumber(cardNumber: string): string {
    const clean = cardNumber.replace(/\D/g, "")
    if (clean.length < 4) return clean
    return `****-****-****-${clean.slice(-4)}`
  }

  /**
   * Limpa número do cartão (remove espaços, hífens, etc.)
   */
  static cleanCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\D/g, "")
  }

  /**
   * Valida se a data de expiração não está vencida
   */
  static isCardExpired(expirationDate: string): boolean {
    const cleanDate = expirationDate.replace("/", "")
    const month = Number.parseInt(cleanDate.substring(0, 2))
    const year = Number.parseInt(cleanDate.substring(2, 6))

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    if (year < currentYear) return true
    if (year === currentYear && month < currentMonth) return true

    return false
  }

  /**
   * Normaliza data de expiração para formato MM/YYYY
   */
  static normalizeExpirationDate(expirationDate: string): string {
    const cleanDate = expirationDate.replace("/", "")
    
    // Se já tem 6 dígitos (MMYYYY)
    if (cleanDate.length === 6) {
      return `${cleanDate.substring(0, 2)}/${cleanDate.substring(2, 6)}`
    }
    
    // Se tem 5 dígitos (MYYYY) - adiciona zero à esquerda
    if (cleanDate.length === 5) {
      return `0${cleanDate.substring(0, 1)}/${cleanDate.substring(1, 5)}`
    }
    
    // Se já tem barra, retorna como está
    return expirationDate
  }
}
