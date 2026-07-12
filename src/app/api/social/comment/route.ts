import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { episode_id, content } = await request.json()
    if (!episode_id || !content?.trim()) {
      return NextResponse.json({ error: 'episode_id and content required' }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Comment must be 500 characters or less' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: user.id, episode_id, content: content.trim() })
      .select(`
        id,
        content,
        created_at,
        user:profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ comment: data })
  } catch (error: any) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get('episode_id')
    const page = parseInt(searchParams.get('page') || '0')
    const limit = 20

    if (!episodeId) {
      return NextResponse.json({ error: 'episode_id required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        user:profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: true })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) throw error

    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('episode_id', episodeId)

    return NextResponse.json({ comments: data || [], total: count || 0 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { comment_id } = await request.json()
    if (!comment_id) {
      return NextResponse.json({ error: 'comment_id required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment_id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
