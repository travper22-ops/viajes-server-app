/// <reference types="vite/client" />

declare global {
  interface Window {
    Stripe: any
    turnstile: any
  }
}

export {}
