'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Series {
  id: string
  title: string
  description: string
  cover_image_url: string
  is_flagship: boolean
  created_at: string
  episodes: {
    id: string
    title: string
    episode_number: number
    is_premium_locked: boolean
    created_at: string
  }[]
}

export default function CreatorDashboard() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('series')
        .select(`
          *,
          episodes (
            id,
            title,
            episode_number,
            is_premium_locked,
            created_at
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSeries(data || [])
    } catch (error) {
      console.error('Error fetching series:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalEpisodes = series.reduce((sum, s) => sum + s.episodes.length, 0)
  const premiumEpisodes = series.reduce(
    (sum, s) => sum + s.episodes.filter(e => e.is_premium_locked).length,
    0
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fadeIn">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Creator Studio</h1>
            <p className="text-gray-500 text-sm">Manage your series and episodes</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/creator/upload')}
            className="btn-primary py-2.5 px-5 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Series
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 animate-fadeIn stagger-1">
          {[
            { label: 'Series', value: series.length, icon: (
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            )},
            { label: 'Episodes', value: totalEpisodes, icon: (
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )},
            { label: 'Premium', value: premiumEpisodes, icon: (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )},
            { label: 'Free', value: totalEpisodes - premiumEpisodes, icon: (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )},
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white/4 border border-white/8 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                {icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-gray-500 text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Series grid / empty state */}
        {series.length === 0 ? (
          <div className="text-center py-24 animate-fadeIn">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">No series yet</h2>
            <p className="text-gray-500 text-sm mb-6">Start creating your first series to share with the world</p>
            <button
              onClick={() => router.push('/dashboard/creator/upload')}
              className="btn-primary py-3 px-7"
            >
              Create Your First Series
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn stagger-2">
            {series.map((s) => (
              <div
                key={s.id}
                className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden card-hover hover:border-purple-500/30 group"
              >
                {/* Thumbnail — vertical aspect ratio for vertical content */}
                {s.cover_image_url ? (
                  <div className="relative overflow-hidden">
                    <img
                      src={s.cover_image_url}
                      alt={s.title}
                      className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badges overlay */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {s.is_flagship && (
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-lg shadow-md">
                          ⭐ Flagship
                        </span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-gray-300 text-xs font-medium rounded-lg">
                        {s.episodes.length} ep
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-purple-900/30 to-pink-900/20 flex items-center justify-center">
                    <svg className="w-14 h-14 text-purple-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    {s.is_flagship && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-lg">
                          ⭐ Flagship
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Card body */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">
                    {s.title}
                  </h3>
                  {s.description && (
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">{s.description}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/creator/upload?seriesId=${s.id}`)}
                      className="flex-1 py-2 text-xs font-medium text-white bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors text-center"
                    >
                      + Add Episode
                    </button>
                    <Link
                      href={`/feed/series/${s.id}`}
                      className="px-3 py-2 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
