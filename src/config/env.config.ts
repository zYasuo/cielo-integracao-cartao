
export const CieloConfig = {
  timeout: 30000,
  routes: {
    cardBin: "https://apiquerysandbox.cieloecommerce.cielo.com.br/1/cardBin/{BIN}",
    zeroAuth: "https://apisandbox.cieloecommerce.cielo.com.br/1/zeroauth/",
    creditCard: "https://apisandbox.cieloecommerce.cielo.com.br/1/sales",
  },
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    MerchantId: process.env.CIELO_MERCHANT_ID || "",
    MerchantKey: process.env.CIELO_MERCHANT_KEY || "",
  },
  cards: {
    test: {
      master: "5502095822650000",
    },
  },
} as const