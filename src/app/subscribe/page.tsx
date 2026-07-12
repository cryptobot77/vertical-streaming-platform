'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel your subscription at any time from your profile page. You will retain access until the end of your current billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex), Apple Pay, and Google Pay — all processed securely through Stripe.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! You can explore our free-tier content without a subscription. Premium content is unlocked immediately upon subscribing.',
  },
  {
    q: 'Can I switch between plans?',
    a: 'Absolutely. You can switch from monthly to yearly (or vice versa) at any time. The difference is prorated automatically.',
  },
]

export default function SubscribePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [processing, setProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single()
      setIsPremium(profile?.is_premium || false)
    } catch (error) {
      console.error('Error checking user status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (priceId: string) => {
    setProcessing(true)
    setCheckoutError(null)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id }),
      })
      const { url } = await response.json()
      if (url) window.location.href = url
      else throw new Error('Failed to create checkout session')
    } catch (error: any) {
      console.error('Subscription error:', error)
      setCheckoutError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const plans = {
    monthly: {
      name: 'Monthly',
      price: '$9.99',
      period: '/month',
      yearlyEquivalent: null,
      features: [
        'Access to all premium content',
        'Ad-free experience',
        'HD & 4K streaming',
        'Cancel anytime',
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
    },
    yearly: {
      name: 'Yearly',
      price: '$99.99',
      period: '/year',
      yearlyEquivalent: '$8.33/mo',
      features: [
        'Access to all premium content',
        'Ad-free experience',
        'HD & 4K streaming',
        'Cancel anytime',
        'Save 17% vs monthly',
        'Priority support',
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_yearly',
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (isPremium) {
    return (
      <div className="min-h-screen bg-black pt-16 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center animate-fadeIn">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">You're Premium! 🎉</h2>
          <p className="text-gray-500 mb-6 text-sm">You already have an active subscription. Enjoy all the content!</p>
          <button
            onClick={() => router.push('/feed')}
            className="btn-primary px-8 py-3"
          >
            Start Watching
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/25 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 text-xs font-medium">Premium Membership</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Unlock all content
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
            Get unlimited access to exclusive series and episodes from top creators.
          </p>
        </div>

        {/* Plan toggle */}
        <div className="flex justify-center mb-10 animate-fadeIn stagger-1">
          <div className="bg-white/6 border border-white/10 rounded-full p-1 flex gap-1">
            {(['monthly', 'yearly'] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  selectedPlan === plan
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {plan === 'monthly' ? 'Monthly' : 'Yearly'}
                {plan === 'yearly' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedPlan === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-500/20 text-green-400'
                  }`}>
                    SAVE 17%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Checkout error */}
        {checkoutError && (
          <div className="max-w-3xl mx-auto mb-6 flex items-start gap-3 bg-red-500/8 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-fadeIn">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {checkoutError}
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto mb-16 animate-fadeIn stagger-2">
          {(Object.entries(plans) as [string, typeof plans.monthly][]).map(([key, plan]) => {
            const isSelected = selectedPlan === key
            const isPopular = key === 'yearly'
            return (
              <div
                key={key}
                onClick={() => setSelectedPlan(key as 'monthly' | 'yearly')}
                className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 border ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/20 border-purple-500/60 shadow-xl shadow-purple-500/15'
                    : 'bg-white/4 border-white/10 hover:border-white/25'
                }`}
              >
                {/* Most Popular badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  {plan.yearlyEquivalent && (
                    <p className="text-purple-300 text-xs mb-3">{plan.yearlyEquivalent} billed annually</p>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-gray-300 text-sm">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-purple-500/30' : 'bg-white/10'
                      }`}>
                        <svg className="w-2.5 h-2.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => { e.stopPropagation(); handleSubscribe(plan.priceId) }}
                  disabled={processing}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25'
                      : 'bg-white/8 text-white hover:bg-white/15 border border-white/10'
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    'Get Started'
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-16 animate-fadeIn stagger-3">
          {[
            { icon: '🔒', text: 'Secure Stripe Payments' },
            { icon: '🔄', text: 'Cancel Anytime' },
            { icon: '💬', text: '24/7 Support' },
            { icon: '🌍', text: 'Global CDN Streaming' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-gray-500 text-sm">
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto animate-fadeIn stagger-4">
          <h2 className="text-2xl font-bold text-white text-center mb-8 tracking-tight">Frequently asked questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/4 border border-white/8 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-white hover:bg-white/4 transition-colors"
                >
                  {faq.q}
                  <svg
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-3 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-60' : 'max-h-0'}`}>
                  <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
