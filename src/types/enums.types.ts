export enum EResponseError {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  FORBIDDEN_ERROR = "FORBIDDEN_ERROR",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
  BAD_REQUEST = "BAD_REQUEST",
  SERVER_ERROR = "SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  PAYMENT_REJECTED = "PAYMENT_REJECTED",
}

export enum ECardType {
  CREDIT = "CreditCard",
  DEBIT = "DebitCard",
}

export enum EBrandCard {
  MASTERCARD = "MASTER", 
  VISA = "VISA",
  AMEX = "AMEX",
  ELO = "ELO",
  HIPERCARD = "HIPERCARD",
  DINERS = "DINERS",
  DISCOVER = "DISCOVER",
  JCB = "JCB",
}

export enum ECurrency {
  BRL = "BRL",
}

export enum ECountry {
  BR = "BRA",
}

export enum EIdentificationType {
  CPF = "CPF",
  CNPJ = "CNPJ",
}

export enum EZeroAuthCardOnFile {
  FIRST = "First",
  USED = "Used",
}

export enum EZeroAuthCardOnFileReason {
  UNSCHEDULED = "Unscheduled",
  RECURRING = "Recurring",
}