// app/api/download-image/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { imageUrl } = await req.json()

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 })
  }

  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch image from OpenAI.')
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64String = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = response.headers.get('Content-Type') || 'image/png'

    return NextResponse.json({ base64: base64String, mimeType })
  } catch (error: any) {
    console.error('Error fetching image:', error)
    return NextResponse.json({ error: 'Failed to fetch image.' }, { status: 500 })
  }
}
