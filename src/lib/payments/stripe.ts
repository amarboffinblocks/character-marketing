import Stripe from "stripe"

let stripeClient: Stripe | null = null

function getSecretKey() {
  const value = process.env.STRIPE_SECRET_KEY?.trim()
  if (!value) {
    throw new Error("Missing STRIPE_SECRET_KEY.")
  }
  return value
}

export function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(getSecretKey())
  }
  return stripeClient
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim())
}
