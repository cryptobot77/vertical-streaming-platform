'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/store'

/**
 * Keeps the client-side premium flag in sync with the user's profile.
 * Mounted once in the root layout; feeds read `isPremium` from the store.
 */
export default function PremiumStateSync() {
  const setPremium = useUserStore((s) => s.setPremium)
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false

    const sync = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) { setPremium(false); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single()

      if (!cancelled) setPremium(!!profile?.is_premium)
    }

    sync()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      sync()
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase, setPremium])

  return null
}
