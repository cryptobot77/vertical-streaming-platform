'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <UploadContent />
    </Suspense>
  )
}

function UploadContent() {
  const searchParams = useSearchParams()
  const seriesId = searchParams.get('seriesId')
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'series' | 'episode'>('series')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Series form state
  const [seriesTitle, setSeriesTitle] = useState('')
  const [seriesDescription, setSeriesDescription] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isFlagship, setIsFlagship] = useState(false)

  // Episode form state
  const [selectedSeriesId, setSelectedSeriesId] = useState(seriesId || '')
  const [episodeTitle, setEpisodeTitle] = useState('')
  const [episodeDescription, setEpisodeDescription] = useState('')
  const [episodeNumber, setEpisodeNumber] = useState(1)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isPremiumLocked, setIsPremiumLocked] = useState(true)
  const [userSeries, setUserSeries] = useState<any[]>([])

  useEffect(() => {
    if (seriesId) {
      setStep('episode')
      setSelectedSeriesId(seriesId)
    }
    fetchUserSeries()
  }, [seriesId])

  const fetchUserSeries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('series')
        .select('id, title')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserSeries(data || [])
    } catch (error) {
      console.error('Error fetching series:', error)
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0])
    }
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
    }
  }

  const uploadToSupabaseStorage = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(path, file)

    if (error) throw error
    return data.path
  }

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let coverImageUrl = null
      if (coverImage) {
        const path = `covers/${user.id}/${Date.now()}_${coverImage.name}`
        coverImageUrl = await uploadToSupabaseStorage(coverImage, path)
        
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(path)
        coverImageUrl = publicUrl
      }

      const { error } = await supabase
        .from('series')
        .insert({
          creator_id: user.id,
          title: seriesTitle,
          description: seriesDescription,
          cover_image_url: coverImageUrl,
          is_flagship: isFlagship,
        })

      if (error) throw error

      router.push('/dashboard/creator')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEpisode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (!videoFile) throw new Error('Please select a video file')

      // Upload video to Supabase Storage
      const videoPath = `episodes/${selectedSeriesId}/${Date.now()}_${videoFile.name}`
      await uploadToSupabaseStorage(videoFile, videoPath)

      // In production, you would send this to Mux for transcoding
      // For now, we'll use the direct storage URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(videoPath)

      const { error } = await supabase
        .from('episodes')
        .insert({
          series_id: selectedSeriesId,
          title: episodeTitle,
          description: episodeDescription,
          episode_number: episodeNumber,
          hls_playback_url: publicUrl,
          is_premium_locked: isPremiumLocked,
          duration_seconds: 0, // Would be populated by Mux
        })

      if (error) throw error

      router.push('/dashboard/creator')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black p-6 pt-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/creator')}
            className="text-gray-400 hover:text-white mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 'series' ? 'Create New Series' : 'Add New Episode'}
          </h1>
          <p className="text-gray-400">
            {step === 'series' 
              ? 'Start a new series to organize your content' 
              : 'Upload a new episode to your series'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {step === 'series' ? (
          <form onSubmit={handleCreateSeries} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Series Title *
              </label>
              <input
                type="text"
                value={seriesTitle}
                onChange={(e) => setSeriesTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter series title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={seriesDescription}
                onChange={(e) => setSeriesDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors min-h-[120px]"
                placeholder="Describe your series"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                  id="cover-image"
                />
                <label
                  htmlFor="cover-image"
                  className="cursor-pointer"
                >
                  {coverImage ? (
                    <div>
                      <p className="text-white mb-2">{coverImage.name}</p>
                      <p className="text-gray-400 text-sm">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400">Click to upload cover image</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="flagship"
                checked={isFlagship}
                onChange={(e) => setIsFlagship(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="flagship" className="text-gray-300">
                Mark as Flagship Series
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Series...' : 'Create Series'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCreateEpisode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Series *
              </label>
              <select
                value={selectedSeriesId}
                onChange={(e) => setSelectedSeriesId(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              >
                <option value="">Choose a series</option>
                {userSeries.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Episode Title *
              </label>
              <input
                type="text"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter episode title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Episode Number *
              </label>
              <input
                type="number"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="1"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={episodeDescription}
                onChange={(e) => setEpisodeDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors min-h-[120px]"
                placeholder="Describe this episode"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video File *
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                  id="video-file"
                />
                <label
                  htmlFor="video-file"
                  className="cursor-pointer"
                >
                  {videoFile ? (
                    <div>
                      <p className="text-white mb-2">{videoFile.name}</p>
                      <p className="text-gray-400 text-sm">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400">Click to upload video file</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="premium"
                checked={isPremiumLocked}
                onChange={(e) => setIsPremiumLocked(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="premium" className="text-gray-300">
                Lock as Premium Content
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading Episode...' : 'Upload Episode'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
