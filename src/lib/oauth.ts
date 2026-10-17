import { createClient } from '@/lib/supabase/client'

export type OAuthProvider = 'github' | 'google'

/**
 * Queries the auth server's public /auth/v1/settings endpoint for the
 * external providers that are actually enabled, so OAuth buttons are only
 * shown when they can work (e.g. GitHub/Google keys are configured).
 */
export async function getEnabledOAuthProviders(): Promise<OAuthProvider[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return []

    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
    })
    if (!res.ok) return []

    const settings = await res.json()
    const external = settings?.external || {}
    const known: OAuthProvider[] = ['github', 'google']
    return known.filter((provider) => external[provider])
  } catch {
    return []
  }
}
