'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import VideoPlayer from '@/components/VideoPlayer'
import CommentSheet from '@/components/CommentSheet'
import { useUserStore } from '@/lib/store'

interface Episode {
  id: string
  title: string
  description: string
  hls_playback_url: string
  source_video_url: string | null
  processing_status: string | null
  is_premium_locked: boolean
  series: {
    id: string
    title: string
    cover_image_url: string
    creator: {
      username: string
      display_name: string
      avatar_url: string
    }
  }
}

interface SocialCounts {
  likes: number
  comments: number
  liked: boolean
}

export default function FeedPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const [socialCounts, setSocialCounts] = useState<Record<string, SocialCounts>>({})
  const [commentEpisodeId, setCommentEpisodeId] = useState<string | null>(null)
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})
  const { isPremium } = useUserStore()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchEpisodes()
    const timer = setTimeout(() => setShowScrollHint(false), 4000)
    return () => clearTimeout(timer)
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
              display_name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEpisodes(data || [])

      // Fetch social counts for all episodes
      if (data && data.length > 0) {
        const ids = data.map(e => e.id).join(',')
        fetchSocialCounts(ids)
      }
    } catch (error) {
      console.error('Error fetching episodes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSocialCounts = async (episodeIds: string) => {
    try {
      const res = await fetch(`/api/social/count?episode_ids=${episodeIds}`)
      const data = await res.json()
      setSocialCounts(data.counts || {})
    } catch (error) {
      console.error('Error fetching social counts:', error)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const scrollTop = container.scrollTop
    const containerHeight = container.clientHeight
    const newIndex = Math.round(scrollTop / containerHeight)
    setShowScrollHint(false)
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < episodes.length) {
      setCurrentIndex(newIndex)
    }
  }

  const handleUnlockPremium = () => {
    router.push('/subscribe')
  }

  const handleLike = async (episodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Optimistic update
    setSocialCounts(prev => ({
      ...prev,
      [episodeId]: {
        ...prev[episodeId],
        liked: !prev[episodeId]?.liked,
        likes: prev[episodeId]?.liked
          ? (prev[episodeId]?.likes || 1) - 1
          : (prev[episodeId]?.likes || 0) + 1,
      },
    }))

    try {
      const res = await fetch('/api/social/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episode_id: episodeId }),
      })
      const data = await res.json()
      setSocialCounts(prev => ({
        ...prev,
        [episodeId]: {
          ...prev[episodeId],
          liked: data.liked,
          likes: data.count,
        },
      }))
    } catch (error) {
      // Revert on error
      setSocialCounts(prev => ({
        ...prev,
        [episodeId]: {
          ...prev[episodeId],
          liked: !prev[episodeId]?.liked,
          likes: prev[episodeId]?.liked
            ? (prev[episodeId]?.likes || 0) + 1
            : Math.max((prev[episodeId]?.likes || 1) - 1, 0),
        },
      }))
    }
  }

  const handleFollow = async (creatorId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // Optimistic update
    setFollowStates(prev => ({ ...prev, [creatorId]: !prev[creatorId] }))

    try {
      const res = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: creatorId }),
      })
      const data = await res.json()
      setFollowStates(prev => ({ ...prev, [creatorId]: data.following }))
    } catch (error) {
      setFollowStates(prev => ({ ...prev, [creatorId]: !prev[creatorId] }))
    }
  }

  const handleShare = (episode: Episode, e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: episode.title,
        url: `${window.location.origin}/feed/series/${episode.series.id}`,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/feed/series/${episode.series.id}`)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory pt-16"
      onScroll={handleScroll}
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {episodes.length === 0 ? (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center px-6 animate-fadeIn">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-purple-600/15 flex items-center justify-center border border-purple-500/20">
              <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">No episodes yet</h2>
            <p className="text-gray-500 mb-6">Check back soon - or create some content!</p>
            <a
              href="/discover"
              className="btn-primary text-sm px-6 py-3"
            >
              Explore Content
            </a>
          </div>
        </div>
      ) : (
        <>
          {episodes.map((episode, index) => {
            const counts = socialCounts[episode.id] || { likes: 0, comments: 0, liked: false }
            const creatorId = episode.series.creator.username
            const isFollowing = followStates[creatorId] || false

            return (
              <div
                key={episode.id}
                className="h-screen w-full snap-start relative"
                style={{ scrollSnapAlign: 'start' }}
              >
                <VideoPlayer
                  videoUrl={episode.hls_playback_url || ''}
                  fallbackUrl={episode.source_video_url}
                  videoId={episode.id}
                  title={episode.title}
                  isPremiumLocked={episode.is_premium_locked && !isPremium}
                  processingStatus={episode.processing_status || undefined}
                  onUnlock={handleUnlockPremium}
                />

                {/* Episode info overlay */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)' }}
                >
                  <div className="p-4 pb-6 pointer-events-auto">
                    {/* Creator info row */}
                    <div className="flex items-center gap-3 mb-3">
                      {episode.series.creator.avatar_url ? (
                        <img
                          src={episode.series.creator.avatar_url}
                          alt={episode.series.creator.display_name || episode.series.creator.username}
                          className="w-9 h-9 rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 border-2 border-white/20">
                          <span className="text-xs font-bold text-white">
                            {(episode.series.creator.display_name || episode.series.creator.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {episode.series.creator.display_name || episode.series.creator.username}
                        </p>
                        <p className="text-gray-400 text-xs truncate">{episode.series.title}</p>
                      </div>
                      <button
                        onClick={(e) => handleFollow(creatorId, e)}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isFollowing
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'border border-white/30 text-white hover:bg-white/10'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>

                    {/* Episode title & description */}
                     <h3 className="text-white text-base font-semibold mb-2 leading-tight">
                      {episode.title}
                    </h3>
                    {episode.description && (
                      <p className="text-gray-400 text-xs line-clamp-2 mb-3 leading-relaxed">
                        {episode.description}
                      </p>
                    )}

                    {/* Action row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {/* Like */}
                        <button
                          onClick={(e) => handleLike(episode.id, e)}
                          className="flex flex-col items-center gap-0.5 group"
                          aria-label="Like"
                        >
                          <svg
                            className={`w-7 h-7 transition-all duration-200 ${counts.liked ? 'text-pink-500 scale-110' : 'text-white group-hover:text-pink-400 group-hover:scale-110'}`}
                            fill={counts.liked ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-white text-[10px]">{counts.likes}</span>
                        </button>

                        {/* Comment */}
                        <button
                          className="flex flex-col items-center gap-0.5 group"
                          aria-label="Comments"
                          onClick={(e) => { e.stopPropagation(); setCommentEpisodeId(episode.id) }}
                        >
                          <svg className="w-7 h-7 text-white group-hover:text-purple-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-white text-[10px]">{counts.comments}</span>
                        </button>

                        {/* Share */}
                        <button
                          onClick={(e) => handleShare(episode, e)}
                          className="flex flex-col items-center gap-0.5 group"
                          aria-label="Share"
                        >
                          <svg className="w-7 h-7 text-white group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span className="text-white text-[10px]">Share</span>
                        </button>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/feed/series/${episode.series.id}`) }}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-xs font-semibold hover:bg-white/20 transition-colors border border-white/15"
                      >
                        View Series
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scroll dot indicators */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none">
                  {episodes.map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentIndex
                          ? 'w-1.5 h-4 bg-white'
                          : 'w-1.5 h-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Scroll hint */}
          {showScrollHint && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none z-30 animate-fadeIn">
              <p className="text-white/60 text-xs">Scroll for more</p>
              <svg className="w-5 h-5 text-white/50 animate-scroll-hint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </>
      )}

      {/* Comment Sheet */}
      <CommentSheet
        episodeId={commentEpisodeId || ''}
        isOpen={!!commentEpisodeId}
        onClose={() => setCommentEpisodeId(null)}
      />
    </div>
  )
}
