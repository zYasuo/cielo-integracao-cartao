import { vi } from "vitest"
import "@testing-library/jest-dom/vitest"

Object.defineProperty(process, "env", {
  value: {
    NODE_ENV: "test",
    CIELO_MERCHANT_ID: "test-merchant-id",
    CIELO_MERCHANT_KEY: "test-merchant-key",
    ALLOW_FOREIGN_CARDS: "false",
    ALLOW_PREPAID_CARDS: "true",
  },
  writable: true,
})

global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
}

global.fetch = vi.fn()

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})