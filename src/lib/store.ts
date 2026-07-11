import { create } from 'zustand'

interface VideoState {
  currentVideoId: string | null
  isPlaying: boolean
  setCurrentVideoId: (id: string | null) => void
  setIsPlaying: (playing: boolean) => void
}

interface UserState {
  isPremium: boolean
  setPremium: (premium: boolean) => void
}

export const useVideoStore = create<VideoState>((set) => ({
  currentVideoId: null,
  isPlaying: false,
  setCurrentVideoId: (id) => set({ currentVideoId: id }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}))

export const useUserStore = create<UserState>((set) => ({
  isPremium: false,
  setPremium: (premium) => set({ isPremium: premium }),
}))
