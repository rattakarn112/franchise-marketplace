// Server-side only Stripe configuration
// This file should only be used in API routes or server-side code

let stripe = null

// Only initialize Stripe on server-side
if (typeof window === 'undefined') {
  const Stripe = require('stripe')
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
  })
}

export const STRIPE_PLANS = {
  premium: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    price: 799,
    name: 'Premium'
  },
  featured: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_FEATURED_PRICE_ID,
    price: 1999,
    name: 'Featured'
  }
}

export const BOOST_PLANS = {
  7: { price: 199, name: '7 วัน' },
  14: { price: 349, name: '14 วัน' },
  30: { price: 599, name: '30 วัน' }
}

export default stripe