import Mux from '@mux/mux-node'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

export interface MuxUploadOptions {
  title: string
  description?: string
}

export async function createMuxUpload(options: MuxUploadOptions) {
  try {
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: 'high',
      },
      cors_origin: '*',
    })

    return upload
  } catch (error) {
    console.error('Error creating Mux upload:', error)
    throw error
  }
}

export async function getMuxAsset(assetId: string) {
  try {
    const asset = await mux.video.assets.retrieve(assetId)
    return asset
  } catch (error) {
    console.error('Error retrieving Mux asset:', error)
    throw error
  }
}

export async function createMuxDirectUpload(uploadUrl: string, file: File) {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    if (!response.ok) {
      throw new Error('Failed to upload to Mux')
    }

    return response
  } catch (error) {
    console.error('Error uploading to Mux:', error)
    throw error
  }
}

export async function deleteMuxAsset(assetId: string) {
  try {
    await mux.video.assets.delete(assetId)
  } catch (error) {
    console.error('Error deleting Mux asset:', error)
    throw error
  }
}
