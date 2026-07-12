'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import VideoPlayer from '@/components/VideoPlayer'
import { useUserStore } from '@/lib/store'

interface Series {
  id: string
  title: string
  description: string
  cover_image_url: string
  is_flagship: boolean
  creator: {
    username: string
    display_name: string
    avatar_url: string
  }
}

interface Episode {
  id: string
  title: string
  description: string
  episode_number: number
  hls_playback_url: string
  source_video_url: string | null
  processing_status: string | null
  is_premium_locked: boolean
  duration_seconds: number
}

export default function SeriesPage() {
  const params = useParams()
  const router = useRouter()
  const [series, setSeries] = useState<Series | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const { isPremium } = useUserStore()
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      fetchSeriesData()
    }
  }, [params.id])

  const fetchSeriesData = async () => {
    try {
      // Fetch series details
      const { data: seriesData, error: seriesError } = await supabase
        .from('series')
        .select(`
          *,
          creator:profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('id', params.id)
        .single()

      if (seriesError) throw seriesError
      setSeries(seriesData)

      // Fetch episodes for this series
      const { data: episodesData, error: episodesError } = await supabase
        .from('episodes')
        .select('*')
        .eq('series_id', params.id)
        .order('episode_number', { ascending: true })

      if (episodesError) throw episodesError
      setEpisodes(episodesData || [])
      
      // Select first episode by default
      if (episodesData && episodesData.length > 0) {
        setSelectedEpisode(episodesData[0])
      }
    } catch (error) {
      console.error('Error fetching series data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlockPremium = () => {
    router.push('/subscribe')
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">Series not found</h2>
          <p className="text-gray-400">The series you're looking for doesn't exist</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Video Player Section */}
      <div className="relative w-full aspect-[9/16] md:aspect-video bg-black">
        {selectedEpisode ? (
          <VideoPlayer
            videoUrl={selectedEpisode.hls_playback_url || ''}
            fallbackUrl={selectedEpisode.source_video_url}
            videoId={selectedEpisode.id}
            title={selectedEpisode.title}
            isPremiumLocked={selectedEpisode.is_premium_locked && !isPremium}
            processingStatus={selectedEpisode.processing_status || undefined}
            onUnlock={handleUnlockPremium}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <p className="text-gray-400">No episodes available</p>
          </div>
        )}
      </div>

      {/* Series Info */}
      <div className="p-6">
        <div className="flex items-start space-x-4 mb-6">
          {series.cover_image_url && (
            <img
              src={series.cover_image_url}
              alt={series.title}
              className="w-24 h-24 rounded-xl object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-white">{series.title}</h1>
              {series.is_flagship && (
                <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                  Flagship
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center space-x-2">
                {series.creator.avatar_url && (
                  <img
                    src={series.creator.avatar_url}
                    alt={series.creator.display_name || series.creator.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-gray-300 text-sm">
                  {series.creator.display_name || series.creator.username}
                </span>
              </div>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 text-sm">{episodes.length} episodes</span>
            </div>
            {series.description && (
              <p className="text-gray-400 text-sm">{series.description}</p>
            )}
          </div>
        </div>

        {/* Episodes List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white mb-4">Episodes</h2>
          {episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => setSelectedEpisode(episode)}
              className={`w-full p-4 rounded-xl transition-all ${
                selectedEpisode?.id === episode.id
                  ? 'bg-purple-600/20 border border-purple-500/50'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-white font-bold">{episode.episode_number}</span>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-medium mb-1">{episode.title}</h3>
                  <div className="flex items-center space-x-3">
                    {episode.duration_seconds > 0 && (
                      <span className="text-gray-400 text-sm">
                        {formatDuration(episode.duration_seconds)}
                      </span>
                    )}
                    {episode.processing_status === 'processing' && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Processing
                      </span>
                    )}
                    {episode.processing_status === 'failed' && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                        Failed
                      </span>
                    )}
                    {episode.is_premium_locked && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                {selectedEpisode?.id === episode.id && (
                  <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
