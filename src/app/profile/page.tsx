'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    avatar_url: '',
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)
      setFormData({
        username: profileData?.username || '',
        display_name: profileData?.display_name || '',
        avatar_url: profileData?.avatar_url || '',
      })

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)

      setSubscriptions(subData || [])
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          display_name: formData.display_name,
          avatar_url: formData.avatar_url,
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, ...formData })
      setEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('id', subscriptionId)

      if (error) throw error

      await supabase
        .from('profiles')
        .update({ is_premium: false })
        .eq('id', profile.id)

      setProfile({ ...profile, is_premium: false })
      setSubscriptions(subscriptions.map(sub =>
        sub.id === subscriptionId ? { ...sub, status: 'canceled' } : sub
      ))
    } catch (error) {
      console.error('Error canceling subscription:', error)
    }
  }

  const avatarLetter = (profile?.display_name || profile?.username || 'U').charAt(0).toUpperCase()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Success toast */}
        {saveSuccess && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl text-sm font-medium shadow-xl animate-fadeIn">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Profile updated successfully!
          </div>
        )}

        <h1 className="text-3xl font-bold text-white mb-8 tracking-tight animate-fadeIn">Profile</h1>

        {/* Profile Card */}
        <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden mb-5 animate-fadeIn">
          {/* Card header with avatar */}
          <div className="p-6 border-b border-white/8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {(editing ? formData.avatar_url : profile?.avatar_url) ? (
                    <img
                      src={editing ? formData.avatar_url : profile?.avatar_url}
                      alt={profile?.display_name || profile?.username}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-2 border-purple-500/30">
                      <span className="text-3xl font-bold text-white">{avatarLetter}</span>
                    </div>
                  )}
                  {profile?.is_premium && !editing && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-black">
                      <span className="text-[10px]">⭐</span>
                    </div>
                  )}
                </div>

                {/* Name info */}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {profile?.display_name || profile?.username}
                  </h2>
                  <p className="text-gray-500 text-sm">@{profile?.username}</p>
                  {profile?.is_premium && (
                    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-full">
                      ⭐ Premium Member
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setEditing(!editing)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  editing
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                    : 'bg-white/8 text-white hover:bg-white/14 border border-white/10'
                }`}
              >
                {editing ? 'Discard' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Card body */}
          <div className="p-6">
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="input-field"
                    placeholder="Your display name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-field"
                    placeholder="username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Avatar URL
                    <span className="text-gray-600 ml-1 font-normal">(paste an image URL)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {formData.avatar_url && (
                    <p className="text-xs text-gray-500 mt-1">Preview updates above ↑</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary py-2.5 px-6 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="btn-secondary py-2.5 px-6 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white/3 rounded-xl p-4 border border-white/6">
                  <p className="text-gray-500 text-xs mb-1">Email</p>
                  <p className="text-white text-sm font-medium truncate">{profile?.email || '—'}</p>
                </div>
                <div className="bg-white/3 rounded-xl p-4 border border-white/6">
                  <p className="text-gray-500 text-xs mb-1">Member since</p>
                  <p className="text-white text-sm font-medium">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <div className="bg-white/3 rounded-xl p-4 border border-white/6">
                  <p className="text-gray-500 text-xs mb-1">Role</p>
                  <p className="text-white text-sm font-medium capitalize">{profile?.role || 'viewer'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6 animate-fadeIn stagger-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white">Subscription</h3>
            {!profile?.is_premium && (
              <Link
                href="/subscribe"
                className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Upgrade →
              </Link>
            )}
          </div>

          {subscriptions.length === 0 ? (
            <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/6">
              <div>
                <p className="text-gray-300 text-sm font-medium">No active subscription</p>
                <p className="text-gray-500 text-xs mt-0.5">Upgrade to unlock premium content</p>
              </div>
              <Link
                href="/subscribe"
                className="btn-primary py-2 px-4 text-sm"
              >
                Upgrade
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/6"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white text-sm font-semibold">Premium Subscription</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        subscription.status === 'active'
                          ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                          : 'bg-red-500/15 text-red-400 border border-red-500/25'
                      }`}>
                        {subscription.status}
                      </span>
                    </div>
                    {subscription.current_period_end && (
                      <p className="text-gray-500 text-xs">
                        {subscription.status === 'active' ? 'Renews' : 'Ended'}:{' '}
                        {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  {subscription.status === 'active' && (
                    <button
                      onClick={() => handleCancelSubscription(subscription.id)}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
