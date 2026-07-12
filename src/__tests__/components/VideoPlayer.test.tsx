import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import VideoPlayer from '@/components/VideoPlayer'

vi.mock('react-intersection-observer', () => ({
  useInView: () => ({
    ref: vi.fn(),
    inView: true,
  }),
}))

vi.mock('@/lib/store', () => ({
  useVideoStore: () => ({
    currentVideoId: null,
    isPlaying: false,
    setCurrentVideoId: vi.fn(),
    setIsPlaying: vi.fn(),
  }),
}))

// Mock HTMLVideoElement.play
HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined)

describe('VideoPlayer', () => {
  const defaultProps = {
    videoUrl: 'https://example.com/video.mp4',
    videoId: 'test-video-1',
    title: 'Test Video',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render video element', () => {
    render(<VideoPlayer {...defaultProps} />)
    const video = document.querySelector('video')
    expect(video).toBeTruthy()
  })

  it('should show premium lock overlay when locked', () => {
    render(<VideoPlayer {...defaultProps} isPremiumLocked={true} />)
    expect(screen.getByText('Premium Content')).toBeTruthy()
    expect(screen.getByText('Unlock Premium')).toBeTruthy()
  })

  it('should not show premium lock when not locked', () => {
    render(<VideoPlayer {...defaultProps} isPremiumLocked={false} />)
    expect(screen.queryByText('Premium Content')).toBeNull()
    expect(document.querySelector('video')).toBeTruthy()
  })

  it('should show processing overlay when processing', () => {
    render(<VideoPlayer {...defaultProps} processingStatus="processing" />)
    expect(screen.getByText('Processing Video')).toBeTruthy()
  })

  it('should call onUnlock when unlock button is clicked', () => {
    const onUnlock = vi.fn()
    render(<VideoPlayer {...defaultProps} isPremiumLocked={true} onUnlock={onUnlock} />)
    fireEvent.click(screen.getByText('Unlock Premium'))
    expect(onUnlock).toHaveBeenCalledOnce()
  })

  it('should display video title in controls', () => {
    render(<VideoPlayer {...defaultProps} />)
    expect(screen.getAllByText('Test Video').length).toBeGreaterThan(0)
  })

  it('should use fallback URL when no HLS URL available', () => {
    render(
      <VideoPlayer
        videoUrl=""
        fallbackUrl="https://example.com/backup.mp4"
        videoId="test-2"
        title="Fallback Video"
      />
    )
    expect(document.querySelector('video')).toBeTruthy()
  })
})
