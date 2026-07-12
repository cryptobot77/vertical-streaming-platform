import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During Vercel build-time static page generation (e.g. /_not-found),
  // NEXT_PUBLIC env vars may not yet be available. Pass placeholder
  // values so createBrowserClient doesn't throw — no actual API calls
  // are made during prerender, so this is safe.
  return createBrowserClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder'
  )
}
