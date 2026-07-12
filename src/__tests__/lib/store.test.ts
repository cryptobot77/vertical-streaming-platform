import { describe, it, expect, beforeEach } from 'vitest'
import { useVideoStore, useUserStore } from '@/lib/store'

describe('useVideoStore', () => {
  beforeEach(() => {
    useVideoStore.setState({ currentVideoId: null, isPlaying: false })
  })

  it('should have default values', () => {
    const state = useVideoStore.getState()
    expect(state.currentVideoId).toBeNull()
    expect(state.isPlaying).toBe(false)
  })

  it('should set current video id', () => {
    useVideoStore.getState().setCurrentVideoId('test-123')
    expect(useVideoStore.getState().currentVideoId).toBe('test-123')
  })

  it('should clear current video id', () => {
    useVideoStore.getState().setCurrentVideoId('test-123')
    useVideoStore.getState().setCurrentVideoId(null)
    expect(useVideoStore.getState().currentVideoId).toBeNull()
  })

  it('should set playing state', () => {
    useVideoStore.getState().setIsPlaying(true)
    expect(useVideoStore.getState().isPlaying).toBe(true)
  })
})

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ isPremium: false })
  })

  it('should have default values', () => {
    const state = useUserStore.getState()
    expect(state.isPremium).toBe(false)
  })

  it('should set premium status', () => {
    useUserStore.getState().setPremium(true)
    expect(useUserStore.getState().isPremium).toBe(true)
  })

  it('should toggle premium off', () => {
    useUserStore.getState().setPremium(true)
    useUserStore.getState().setPremium(false)
    expect(useUserStore.getState().isPremium).toBe(false)
  })
})
