import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Mux from '@mux/mux-node'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('mux-signature')

  if (!signature) {
    return new NextResponse('Missing Mux signature', { status: 400 })
  }

  let event: any

  try {
    event = await mux.webhooks.unwrap(
      body,
      { 'mux-signature': signature },
      process.env.MUX_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Mux webhook signature verification failed:', err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'video.asset.ready': {
      const asset = event.data
      const assetId = asset.id
      const playbackUrl = asset.playback_ids?.[0]
        ? `https://stream.mux.com/${asset.playback_ids[0]}.m3u8`
        : null
      const duration = asset.duration ? Math.round(asset.duration) : null

      if (playbackUrl) {
        const { error } = await supabase
          .from('episodes')
          .update({
            hls_playback_url: playbackUrl,
            duration_seconds: duration,
            processing_status: 'ready',
          })
          .eq('mux_asset_id', assetId)

        if (error) {
          console.error('Error updating episode from Mux webhook:', error)
        }
      }
      break
    }

    case 'video.asset.created': {
      const asset = event.data
      const assetId = asset.id

      const { error } = await supabase
        .from('episodes')
        .update({ processing_status: 'processing' })
        .eq('mux_asset_id', assetId)

      if (error) {
        console.error('Error updating processing status:', error)
      }
      break
    }

    case 'video.asset.errored': {
      const asset = event.data
      const assetId = asset.id

      const { error } = await supabase
        .from('episodes')
        .update({ processing_status: 'failed' })
        .eq('mux_asset_id', assetId)

      if (error) {
        console.error('Error marking episode as failed:', error)
      }
      break
    }

    case 'video.upload.created': {
      break
    }

    case 'video.upload.video_asset.created': {
      const upload = event.data
      const assetId = upload.asset_id

      if (assetId) {
        const { error } = await supabase
          .from('episodes')
          .update({ mux_asset_id: assetId })
          .eq('mux_asset_id', `upload:${upload.id}`)

        if (error) {
          console.error('Error linking asset to episode:', error)
        }
      }
      break
    }

    default:
      console.log(`Unhandled Mux event type: ${event.type}`)
  }

  return new NextResponse(null, { status: 200 })
}
