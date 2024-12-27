// app/api/final/route.ts
import { NextResponse } from 'next/server'
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '', 
})

export async function POST(req: Request) {
  const { likability, obsession, dependency, friendship, heroineSettings } = await req.json()

  const promptContent = `
    あなたは、テキストベースの恋愛シミュレーションゲームのアシスタントです。
    以下のパラメータ、会話履歴、ヒロインの設定を基に、ゲームの最終ストーリーを生成してください。

    パラメータ:
    - 好感度: ${likability} / 100
    - 執着度: ${obsession} / 100
    - 依存度: ${dependency} / 100
    - 友好度: ${friendship} / 100

    ヒロインの設定:
    - 名前: ${heroineSettings.name}
    - 外見: ${heroineSettings.appearance}
    - 性格: ${heroineSettings.personality}

    このパラメータと設定に基づいて、ヒロインとの関係性がどのように発展したかを描写するストーリーを生成してください。感情豊かで詳細な描写を心がけてください。

    有効なJSONのみを返してください。コードフェンスやマークダウン、追加のテキストは含めないでください。
    JSONの形式は次のようにしてください：
    {
      "story": "..."
    }
  `

  const promptMessages = [
    {
      role: "system",
      content: promptContent
    }
  ]

  try {
    // ストーリー生成
    const completion = await openai.chat.completions.create({
      model: "chatgpt-4o-latest", // 正しいモデル名に修正
      messages: promptMessages,
      temperature: 0.7
    })

    let content = completion.choices[0].message?.content || ''
    // 不要な文字列を取り除く
    content = content.replace(/```json|```|`/g, '').trim()

    let story = ''
    try {
      const parsed = JSON.parse(content)
      story = parsed.story
    } catch (error) {
      console.error("Failed to parse JSON from LLM:", error)
      story = "エラーが発生しました。ストーリーの生成に失敗しました。"
    }

    // 画像生成用プロンプトを作成
    const imagePrompt = `
      ストーリー: ${story}

      このストーリーを基にした感動的なシーンのイラストを生成してください。背景は透過PNG形式で、クオリティは高く、詳細に描写してください。ヒロインの特徴は以下の通りです:
      - 名前: ${heroineSettings.name}
      - 外見: ${heroineSettings.appearance}
      - 性格: ${heroineSettings.personality}
    `

    // 画像生成
    let imageUrl = ''
    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      });

      imageUrl = imageResponse.data[0].url
    } catch (error: any) {
      console.error("Image generation error:", error)
      // 画像生成に失敗した場合でもストーリーは返す
      imageUrl = ''
    }

    console.log('画像URL:', imageUrl)
    return NextResponse.json({ story, prompt: promptContent, imageUrl })
  } catch (error: any) {
    console.error("Error generating final story:", error)
    return NextResponse.json({ story: "エラーが発生しました。ストーリーの生成に失敗しました。", prompt: promptContent, imageUrl: '' })
  }
}
