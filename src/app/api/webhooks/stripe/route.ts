import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const subscriptionId = session.subscription as string

      if (userId && subscriptionId) {
        // Update user's premium status
        await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', userId)

        // Create subscription record
        await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            price_id: session.metadata?.price_id,
            current_period_end: new Date(session.expires_at! * 1000).toISOString(),
          })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const { data } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (data) {
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        // Update premium status based on subscription status
        await supabase
          .from('profiles')
          .update({ is_premium: subscription.status === 'active' })
          .eq('id', data.user_id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const { data } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (data) {
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        // Remove premium status
        await supabase
          .from('profiles')
          .update({ is_premium: false })
          .eq('id', data.user_id)
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      if ((invoice as any).subscription) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_end: new Date(invoice.period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', (invoice as any).subscription)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if ((invoice as any).subscription) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', (invoice as any).subscription)
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return new NextResponse(null, { status: 200 })
}
