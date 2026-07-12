import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { following_id } = await request.json()
    if (!following_id) {
      return NextResponse.json({ error: 'following_id required' }, { status: 400 })
    }

    if (user.id === following_id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', following_id)
      .single()

    if (existing) {
      // Unfollow
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('id', existing.id)

      if (error) throw error

      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', following_id)

      return NextResponse.json({ following: false, followerCount: count || 0 })
    } else {
      // Follow
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id })

      if (error) throw error

      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', following_id)

      return NextResponse.json({ following: true, followerCount: count || 0 })
    }
  } catch (error: any) {
    console.error('Follow toggle error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }

    const { count: followerCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    const { data: { user } } = await supabase.auth.getUser()
    let isFollowing = false

    if (user && user.id !== userId) {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single()

      isFollowing = !!data
    }

    return NextResponse.json({
      followerCount: followerCount || 0,
      followingCount: followingCount || 0,
      isFollowing,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
