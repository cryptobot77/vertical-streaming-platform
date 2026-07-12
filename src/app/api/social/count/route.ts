import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const episodeIds = searchParams.get('episode_ids')?.split(',').filter(Boolean)

    if (!episodeIds || episodeIds.length === 0) {
      return NextResponse.json({ error: 'episode_ids required' }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    const counts: Record<string, { likes: number; comments: number; liked: boolean }> = {}

    for (const epId of episodeIds) {
      const { count: likeCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('episode_id', epId)

      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('episode_id', epId)

      let liked = false
      if (user) {
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('episode_id', epId)
          .single()
        liked = !!data
      }

      counts[epId] = {
        likes: likeCount || 0,
        comments: commentCount || 0,
        liked,
      }
    }

    return NextResponse.json({ counts })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
