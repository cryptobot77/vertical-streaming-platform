'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Series {
  id: string
  title: string
  description: string
  cover_image_url: string
  is_flagship: boolean
  created_at: string
  creator: {
    username: string
    display_name: string
    avatar_url: string
  }
  episodes: {
    id: string
  }[]
}

function SeriesSkeleton() {
  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
      <div className="w-full aspect-[3/4] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-2/3 skeleton rounded" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 w-16 skeleton rounded" />
          <div className="h-3 w-12 skeleton rounded" />
        </div>
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const supabase = createClient()

  // Debounce search — 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('series')
        .select(`
          *,
          creator:profiles (
            username,
            display_name,
            avatar_url
          ),
          episodes (id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSeries(data || [])
    } catch (error) {
      console.error('Error fetching series:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSeries = series.filter(s => {
    const matchesSearch =
      s.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(debouncedQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'flagship' && s.is_flagship) ||
      (selectedCategory === 'regular' && !s.is_flagship)
    return matchesSearch && matchesCategory
  })

  const counts = {
    all: series.length,
    flagship: series.filter(s => s.is_flagship).length,
    regular: series.filter(s => !s.is_flagship).length,
  }

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'flagship', label: '⭐ Flagship' },
    { key: 'regular', label: 'Regular' },
  ]

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fadeIn">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Discover</h1>
          <p className="text-gray-500">
            {loading ? 'Loading content…' : `${series.length} series from top creators`}
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6 animate-fadeIn stagger-1">
          <div className="relative">
            <svg
              className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search series, creators…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mb-8 no-scrollbar overflow-x-auto pb-1 animate-fadeIn stagger-2">
          {categories.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                selectedCategory === key
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25'
                  : 'bg-white/6 text-gray-400 hover:bg-white/12 hover:text-white border border-white/8'
              }`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedCategory === key ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {counts[key as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SeriesSkeleton key={i} />
            ))}
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="text-center py-24 animate-fadeIn">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No series found</h2>
            <p className="text-gray-500 mb-6 text-sm">
              {searchQuery ? `No results for "${searchQuery}"` : 'Try a different filter'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn-secondary text-sm px-6 py-2.5"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredSeries.map((s, i) => (
              <Link
                key={s.id}
                href={`/feed/series/${s.id}`}
                className={`group block animate-fadeIn`}
                style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}
              >
                <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden card-hover hover:border-purple-500/30">
                  {/* Cover image */}
                  {s.cover_image_url ? (
                    <div className="relative overflow-hidden">
                      <img
                        src={s.cover_image_url}
                        alt={s.title}
                        className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Episode count badge */}
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
                        {s.episodes.length} ep
                      </div>
                      {/* Flagship badge */}
                      {s.is_flagship && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xs text-white font-semibold">
                          ⭐ Flagship
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-purple-900/30 to-pink-900/20 flex items-center justify-center">
                      <svg className="w-14 h-14 text-purple-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                      {s.is_flagship && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xs text-white font-semibold">
                          ⭐ Flagship
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors duration-200 line-clamp-1 mb-1">
                      {s.title}
                    </h3>
                    {s.description && (
                      <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {s.creator.avatar_url ? (
                        <img
                          src={s.creator.avatar_url}
                          alt={s.creator.display_name || s.creator.username}
                          className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex-shrink-0" />
                      )}
                      <span className="text-gray-500 text-xs truncate">
                        {s.creator.display_name || s.creator.username}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
