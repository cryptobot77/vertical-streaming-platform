'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Feed error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="text-center animate-fadeIn">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-500 mb-6 text-sm">We couldn&apos;t load your feed. Please try again.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary px-8">
            Try Again
          </button>
          <Link href="/" className="btn-secondary px-8">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
