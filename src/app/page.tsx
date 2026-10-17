'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatorStudioClick = () => {
    router.push(user ? '/dashboard/creator' : '/login')
  }

  return (
    <div className="min-h-screen bg-black">

      {/* ━━━━━━━━━━━━━━━━━━━━━━
          HERO
      ━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/25 via-black to-pink-900/15 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — copy */}
            <div className="animate-fadeIn">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/25 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-purple-300 text-xs font-medium tracking-wide">Premium Vertical Streaming</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                The future of
                <span className="block bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  vertical content
                </span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
                Discover exclusive series from top creators. Premium vertical videos,
                optimized for mobile — experience the next generation of entertainment.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link href="/signup" className="btn-primary text-base">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Start Watching Free
                </Link>
                <Link href="/feed" className="btn-secondary text-base">
                  Explore Content
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Stats bar */}
              <div className="flex items-center gap-6 pt-6 border-t border-white/8">
                <div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-gray-500 text-sm">Active viewers</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-gray-500 text-sm">Episodes</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-gray-500 text-sm">Creators</p>
                </div>
              </div>
            </div>

            {/* Right — phone mockup */}
            <div className="flex justify-center lg:justify-end animate-fadeIn stagger-2">
              <div className="relative animate-float">
                {/* Outer glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-600/30 to-pink-600/30 blur-2xl rounded-[40px] scale-110" />

                {/* Phone frame */}
                <div className="relative w-64 aspect-[9/19.5] bg-gradient-to-b from-purple-950 via-[#150320] to-pink-950 rounded-[40px] border-2 border-white/15 shadow-2xl overflow-hidden">
                  {/* Top notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 border border-white/10" />

                  {/* Video thumbnail scene — site palette */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 240 520"
                    preserveAspectRatio="xMidYMid slice"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="phoneSceneSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#2e1065" />
                        <stop offset="0.5" stopColor="#7e22ce" />
                        <stop offset="0.78" stopColor="#db2777" />
                        <stop offset="1" stopColor="#150320" />
                      </linearGradient>
                      <radialGradient id="phoneSceneGlow" cx="0.5" cy="0.26" r="0.5">
                        <stop offset="0" stopColor="#f5d0fe" stopOpacity="0.95" />
                        <stop offset="0.45" stopColor="#ec4899" stopOpacity="0.55" />
                        <stop offset="1" stopColor="#ec4899" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect width="240" height="520" fill="url(#phoneSceneSky)" />
                    {/* glowing sun */}
                    <circle cx="120" cy="140" r="72" fill="url(#phoneSceneGlow)" />
                    <circle cx="120" cy="140" r="22" fill="#fbcfe8" />
                    {/* city skyline silhouette */}
                    <path
                      d="M0 348h26v-58h20v58h16v-86h24v86h18v-44h22v44h14v-72h26v72h18v-38h24v38h16v-64h22v64h14v190H0z"
                      fill="#12021f"
                    />
                    {/* window lights */}
                    <g fill="#f0abfc" opacity="0.7">
                      <rect x="34" y="304" width="3" height="5" />
                      <rect x="42" y="318" width="3" height="5" />
                      <rect x="70" y="282" width="3" height="5" />
                      <rect x="78" y="296" width="3" height="5" />
                      <rect x="122" y="292" width="3" height="5" />
                      <rect x="130" y="308" width="3" height="5" />
                      <rect x="170" y="300" width="3" height="5" />
                      <rect x="196" y="304" width="3" height="5" />
                      <rect x="204" y="320" width="3" height="5" />
                    </g>
                  </svg>

                  {/* Depth tint over the scene */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/40 border border-white/20">
                      <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Bottom overlay info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      <div className="h-2 w-16 bg-white/30 rounded-full skeleton" />
                    </div>
                    <div className="h-2 w-32 bg-white/20 rounded-full mb-1 skeleton" />
                    <div className="h-2 w-24 bg-white/15 rounded-full skeleton" />

                    {/* Progress bar */}
                    <div className="mt-3 h-0.5 bg-white/20 rounded-full">
                      <div className="h-full w-2/5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                    </div>
                  </div>

                  {/* Right-side action icons */}
                  <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━
          FEATURES
      ━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Why choose <span className="gradient-text">StreamVault?</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Everything you need for the ultimate vertical content experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="panel p-7 panel-hover group">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center mb-5 ">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
               <h3 className="text-xl font-semibold text-white mb-3">Mobile-First</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Engineered for vertical screens with smooth snap scrolling and auto-play. The TikTok-style experience for premium content creators.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="panel p-7 panel-hover group">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mb-5 ">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
               <h3 className="text-xl font-semibold text-white mb-3">Premium Content</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Exclusive series from verified creators, protected by enterprise-grade DRM. Pay once, stream everywhere.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="panel p-7 panel-hover group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center mb-5 ">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
               <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Powered by Mux and a global CDN. Adaptive bitrate streaming ensures zero buffering regardless of connection speed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━
          CREATOR SECTION
      ━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 border border-pink-500/25 rounded-full mb-6">
                <svg className="w-3.5 h-3.5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a5 5 0 110 10A5 5 0 0112 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z"/>
                </svg>
                <span className="text-pink-300 text-xs font-medium tracking-wide">For Creators</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-5 tracking-tight">
                Build your audience.<br />
                <span className="gradient-text">Monetize your craft.</span>
              </h2>
              <p className="text-gray-400 mb-7 leading-relaxed">
                Our creator studio makes it effortless to upload, organize, and monetize your vertical series. Keep up to 85% of your revenue.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Drag-and-drop video upload with Mux',
                  'Flexible premium & free episode tiers',
                  'Real-time analytics & earnings dashboard',
                  'Dedicated creator support team',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-primary">
                Start Creating Today
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Creator stats card */}
            <div className="space-y-4 animate-fadeIn stagger-2">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">Monthly Earnings</h4>
                  <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">↑ 0%</span>
                </div>
                <p className="text-4xl font-bold text-white mb-1">$0</p>
                <p className="text-gray-500 text-sm">growing an audience takes time</p>
                <div className="mt-4 h-1.5 bg-white/10 rounded-full">
                  <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5">
                  <p className="text-gray-400 text-xs mb-2">Total Views</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="glass rounded-2xl p-5">
                  <p className="text-gray-400 text-xs mb-2">Subscribers</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
              <button
                onClick={handleCreatorStudioClick}
                className="w-full py-3 border border-purple-500/30 text-purple-300 rounded-xl text-sm font-medium hover:bg-purple-500/10 transition-all duration-200"
              >
                {user ? 'Open Creator Studio →' : 'Sign in to access studio →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━
          CTA
      ━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-purple rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 pointer-events-none" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                Ready to start watching?
              </h2>
              <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                Join over 50,000 viewers enjoying premium vertical content. Free to start — premium available anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/signup" className="btn-primary text-base px-8">
                  Create Free Account
                </Link>
                <Link href="/discover" className="btn-secondary text-base px-8">
                  Browse Content
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">StreamVault</span>
            </Link>
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
              <Link href="/feed" className="hover:text-gray-300 transition-colors">Feed</Link>
              <Link href="/discover" className="hover:text-gray-300 transition-colors">Discover</Link>
              <Link href="/subscribe" className="hover:text-gray-300 transition-colors">Pricing</Link>
              <Link href="/login" className="hover:text-gray-300 transition-colors">Login</Link>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-white/6 text-center text-gray-600 text-sm">
            <p>© 2026 StreamVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
