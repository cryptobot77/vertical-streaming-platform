'use client'

import { useRef, useEffect, useState } from 'react'
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

  useEffect(() => {
    if (inView && videoRef.current) {
      // Play video when in view
      videoRef.current.play()
      setCurrentVideoId(videoId)
      setIsPlaying(true)
    } else if (!inView && videoRef.current) {
      // Pause video when out of view
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [inView, videoId, setCurrentVideoId, setIsPlaying])

  useEffect(() => {
    // Pause other videos when this one becomes current
    if (currentVideoId !== videoId && videoRef.current) {
      videoRef.current.pause()
    }
  }, [currentVideoId, videoId])

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(videoRef.current.muted)
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  return (
    <div
      ref={ref}
      className="relative w-full h-full bg-black flex items-center justify-center"
    >
      {isPremiumLocked ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/80 via-black/60 to-black/80 z-10">
          <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.62-2.48C2.7 12.94 3.53 11 5 11h14c1.47 0 2.3 1.94 2.38 3.52L22 17v5H2v-5z" />
            </svg>
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Premium Content</h3>
          <p className="text-gray-400 text-center px-8 mb-6">
            Unlock this episode and hundreds more with a premium subscription
          </p>
          <button
            onClick={onUnlock}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Unlock Premium
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            loop
            playsInline
            muted={isMuted}
            onClick={handlePlayPause}
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {isMuted ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleToggleMute}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {isMuted ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
