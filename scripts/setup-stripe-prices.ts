/**
 * Stripe Price Setup Script
 *
 * Run with: npx tsx scripts/setup-stripe-prices.ts
 *
 * Creates the StreamVault Premium product and monthly/yearly prices in Stripe.
 * Outputs the price IDs to add to .env.local
 */

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil' as Stripe.LatestApiVersion,
})

async function main() {
  console.log('Setting up Stripe products and prices...\n')

  // 1. Create the product
  const product = await stripe.products.create({
    name: 'StreamVault Premium',
    description: 'Unlock all premium vertical content, ad-free HD & 4K streaming',
    metadata: { app: 'streamvault' },
  })
  console.log(`Product created: ${product.id}`)

  // 2. Create monthly price ($9.99/mo)
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 999, // $9.99 in cents
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { plan: 'monthly' },
  })
  console.log(`Monthly price created: ${monthlyPrice.id}`)

  // 3. Create yearly price ($99.99/yr)
  const yearlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 9999, // $99.99 in cents
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { plan: 'yearly' },
  })
  console.log(`Yearly price created: ${yearlyPrice.id}`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Add these to your .env.local:\n')
  console.log(`NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`)
  console.log(`NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=${yearlyPrice.id}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
