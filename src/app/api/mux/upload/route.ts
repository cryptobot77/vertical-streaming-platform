import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Mux from '@mux/mux-node'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename } = await request.json()

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: 'premium',
        meta: {
          creator_id: user.id,
          title: filename,
        },
      },
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || '*',
    })

    return NextResponse.json({
      upload_url: upload.url,
      upload_id: upload.id,
    })
  } catch (error: any) {
    console.error('Mux upload creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create upload' },
      { status: 500 }
    )
  }
}
