import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { episode_id } = await request.json()
    if (!episode_id) {
      return NextResponse.json({ error: 'episode_id required' }, { status: 400 })
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('episode_id', episode_id)
      .single()

    if (existing) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existing.id)

      if (error) throw error

      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('episode_id', episode_id)

      return NextResponse.json({ liked: false, count: count || 0 })
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: user.id, episode_id })

      if (error) throw error

      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('episode_id', episode_id)

      return NextResponse.json({ liked: true, count: count || 0 })
    }
  } catch (error: any) {
    console.error('Like toggle error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get('episode_id')

    if (!episodeId) {
      return NextResponse.json({ error: 'episode_id required' }, { status: 400 })
    }

    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('episode_id', episodeId)

    const { data: { user } } = await supabase.auth.getUser()
    let liked = false

    if (user) {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('episode_id', episodeId)
        .single()

      liked = !!data
    }

    return NextResponse.json({ count: count || 0, liked })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
