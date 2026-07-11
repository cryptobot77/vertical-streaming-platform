'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import VideoPlayer from '@/components/VideoPlayer'
import { useUserStore } from '@/lib/store'

interface Episode {
  id: string
  title: string
  description: string
  hls_playback_url: string
  is_premium_locked: boolean
  series: {
    id: string
    title: string
    cover_image_url: string
    creator: {
      username: string
      display_name: string
    }
  }
}

export default function FeedPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isPremium } = useUserStore()
  const supabase = createClient()

  useEffect(() => {
    fetchEpisodes()
  }, [])

  const fetchEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select(`
          *,
          series (
            id,
            title,
            cover_image_url,
            creator:profiles (
              username,
              display_name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEpisodes(data || [])
    } catch (error) {
      console.error('Error fetching episodes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const scrollTop = container.scrollTop
    const containerHeight = container.clientHeight
    const newIndex = Math.round(scrollTop / containerHeight)
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < episodes.length) {
      setCurrentIndex(newIndex)
    }
  }

  const handleUnlockPremium = () => {
    // Navigate to subscription page
    window.location.href = '/subscribe'
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory" onScroll={handleScroll}>
      {episodes.length === 0 ? (
        <div className="h-screen flex items-center justify-center bg-black">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">No episodes yet</h2>
            <p className="text-gray-400">Check back later for new content</p>
          </div>
        </div>
      ) : (
        episodes.map((episode, index) => (
          <div
            key={episode.id}
            className="h-screen w-full snap-start relative"
          >
            <VideoPlayer
              videoUrl={episode.hls_playback_url || ''}
              videoId={episode.id}
              title={episode.title}
              isPremiumLocked={episode.is_premium_locked && !isPremium}
              onUnlock={handleUnlockPremium}
            />
            
            {/* Episode Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
              <div className="flex items-start space-x-4">
                {episode.series.cover_image_url && (
                  <img
                    src={episode.series.cover_image_url}
                    alt={episode.series.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-white text-xl font-semibold mb-1">
                    {episode.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">
                    {episode.series.title} • {episode.series.creator.display_name || episode.series.creator.username}
                  </p>
                  {episode.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {episode.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-6">
                  <button className="flex flex-col items-center space-y-1">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-white text-xs">Like</span>
                  </button>
                  <button className="flex flex-col items-center space-y-1">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-white text-xs">Comment</span>
                  </button>
                  <button className="flex flex-col items-center space-y-1">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="text-white text-xs">Share</span>
                  </button>
                </div>
                <button
                  onClick={() => window.location.href = `/series/${episode.series.id}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-semibold hover:bg-purple-700 transition-colors"
                >
                  View Series
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
