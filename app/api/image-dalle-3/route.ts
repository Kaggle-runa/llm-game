// app/api/generate-image/route.ts
import { NextResponse } from 'next/server'
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '', 
})

export async function POST(req: Request) {
  const { prompt } = await req.json()

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error("Image generation error:", error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
