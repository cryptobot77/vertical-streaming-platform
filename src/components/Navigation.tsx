'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const navLinkClass = (href: string) =>
    `relative text-sm font-medium transition-colors duration-200 ${
      isActive(href)
        ? 'text-white'
        : 'text-gray-400 hover:text-white'
    }`

  const mobileLinkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive(href)
        ? 'bg-purple-500/15 text-white border border-purple-500/30'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-200">
              <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">StreamVault</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link href="/feed" className={navLinkClass('/feed')}>
              <span className="px-3 py-1.5">Feed</span>
              {isActive('/feed') && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              )}
            </Link>
            <Link href="/discover" className={navLinkClass('/discover')}>
              <span className="px-3 py-1.5">Discover</span>
              {isActive('/discover') && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              )}
            </Link>

            {!loading && (
              <div className="flex items-center gap-1.5 ml-2">
                {user ? (
                  <>
                    <Link href="/dashboard/creator" className={navLinkClass('/dashboard')}>
                      <span className="px-3 py-1.5">Creator Studio</span>
                      {isActive('/dashboard') && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                      )}
                    </Link>
                    <Link href="/profile" className={navLinkClass('/profile')}>
                      <span className="px-3 py-1.5">Profile</span>
                      {isActive('/profile') && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                      )}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="ml-2 px-4 py-1.5 bg-white/8 text-gray-300 text-sm font-medium rounded-lg hover:bg-white/15 hover:text-white transition-all duration-200 border border-white/10"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="ml-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-200 shadow-md shadow-purple-500/20"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu — smooth slide-down animation */}
      <div
        id="mobile-menu"
        role="menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-white/10 ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1.5 bg-black/95 backdrop-blur-xl">
          <Link href="/feed" className={mobileLinkClass('/feed')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            Feed
          </Link>
          <Link href="/discover" className={mobileLinkClass('/discover')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Discover
          </Link>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard/creator" className={mobileLinkClass('/dashboard')}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Creator Studio
                  </Link>
                  <Link href="/profile" className={mobileLinkClass('/profile')}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <div className="pt-2 pb-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-2 pb-1 flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-200"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
