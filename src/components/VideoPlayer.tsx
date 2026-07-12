'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { useVideoStore } from '@/lib/store'

interface VideoPlayerProps {
  videoUrl: string
  videoId: string
  title: string
  isPremiumLocked?: boolean
  onUnlock?: () => void
}

export default function VideoPlayer({
  videoUrl,
  videoId,
  title,
  isPremiumLocked = false,
  onUnlock,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { ref, inView } = useInView({
    threshold: 0.8,
    triggerOnce: false,
  })
  const { currentVideoId, setCurrentVideoId, setIsPlaying } = useVideoStore()
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setLocalIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(false)
  const [showTapFeedback, setShowTapFeedback] = useState(false)
  const [tapFeedbackAction, setTapFeedbackAction] = useState<'play' | 'pause'>('pause')
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-play when in view
  useEffect(() => {
    if (inView && videoRef.current) {
      videoRef.current.play().then(() => {
        setCurrentVideoId(videoId)
        setIsPlaying(true)
        setLocalIsPlaying(true)
      }).catch(() => {})
    } else if (!inView && videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
      setLocalIsPlaying(false)
    }
  }, [inView, videoId, setCurrentVideoId, setIsPlaying])

  // Pause other videos when another becomes active
  useEffect(() => {
    if (currentVideoId !== videoId && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause()
      setLocalIsPlaying(false)
    }
  }, [currentVideoId, videoId])

  // Progress tracking
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration || 0
      if (total > 0) setProgress((current / total) * 100)
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }, [])

  const handleWaiting = useCallback(() => setIsBuffering(true), [])
  const handleCanPlay = useCallback(() => setIsBuffering(false), [])

  // Show controls on tap/touch
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
  }, [])

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [])

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      const willPlay = videoRef.current.paused
      if (willPlay) {
        videoRef.current.play()
        setLocalIsPlaying(true)
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setLocalIsPlaying(false)
        setIsPlaying(false)
      }
      setTapFeedbackAction(willPlay ? 'play' : 'pause')
      setShowTapFeedback(true)
      setTimeout(() => setShowTapFeedback(false), 600)
    }
    showControlsTemporarily()
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      videoRef.current.currentTime = ratio * duration
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={ref}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden group"
      onClick={handlePlayPause}
      onMouseMove={showControlsTemporarily}
    >
      {isPremiumLocked ? (
        /* ── Premium lock overlay ── */
        <div className="absolute inset-0 flex flex-col items-center justify-center glass-dark z-10">
          <div className="w-20 h-20 mb-5 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/40 animate-pulse-glow">
            <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.62-2.48C2.7 12.94 3.53 11 5 11h14c1.47 0 2.3 1.94 2.38 3.52L22 17v5H2v-5z" />
            </svg>
          </div>
          <h3 className="text-white text-2xl font-bold mb-2 tracking-tight">Premium Content</h3>
          <p className="text-gray-400 text-center px-10 mb-6 text-sm leading-relaxed">
            Unlock this episode and hundreds more with a premium subscription
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onUnlock?.() }}
            className="btn-primary px-8 py-3 text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Unlock Premium
          </button>
        </div>
      ) : (
        <>
          {/* ── Video element ── */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            loop
            playsInline
            muted={isMuted}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={handleWaiting}
            onCanPlay={handleCanPlay}
          />

          {/* ── Buffering spinner ── */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* ── Play/Pause tap feedback ── */}
          {showTapFeedback && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center animate-fadeInScale">
                {tapFeedbackAction === 'pause' ? (
                  <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-9 h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* ── Controls overlay — always visible on mobile, hover on desktop ── */}
          <div
            className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
            }`}
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)' }}
          >
            <div className="p-4 pb-3 space-y-3" onClick={(e) => e.stopPropagation()}>
              {/* Title */}
              <h3 className="text-white font-semibold text-base leading-tight text-shadow">{title}</h3>

              {/* Progress bar */}
              <div
                className="w-full h-1 bg-white/20 rounded-full cursor-pointer group/progress"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative transition-all duration-100"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Control buttons + time */}
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={(e) => { e.stopPropagation(); handlePlayPause() }}
                  className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/25 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Mute toggle */}
                <button
                  onClick={handleToggleMute}
                  className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/25 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>

                {/* Time display */}
                <span className="text-white/70 text-xs ml-auto">
                  {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Mobile: always-visible mute button (bottom-right, doesn't require hover) ── */}
          <div className="absolute bottom-20 right-4 md:hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleToggleMute}
              className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
