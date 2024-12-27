// app/api/scene/route.ts
import { NextResponse } from 'next/server'
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '', 
})

export async function POST(req: Request) {
  const { userInput, currentScene, heroineSettings, scenes } = await req.json()
  console.log('過去のシーン:', scenes)

  // 過去のシーンをテキスト形式でまとめる
  const historyText = scenes.map((scene: any, index: number) => 
    `シーン${index + 1}:
    テキスト: ${scene.text}
    ダイアログ: ${scene.dialogue}`
  ).join('\n\n')

  const promptContent = `
    あなたは、テキストベースの恋愛シミュレーションゲームのアシスタントです。
    以下はストーリーの履歴と現在のシーン、ヒロインの設定、ユーザーの入力です。
    これらを元に、新しいシーンとヒロインのパラメータの変更を生成してください。

    ストーリーの履歴:
    ${historyText}

    最新のシーン:
    テキスト: ${currentScene.text}
    ダイアログ: ${currentScene.dialogue}

    ヒロインの設定:
    名前: ${heroineSettings.name}
    容姿: ${heroineSettings.appearance}
    性格: ${heroineSettings.personality}
    好感度: ${heroineSettings.likability} 相手に対する恋愛感情を抱いている度合いを示す。
    執着度: ${heroineSettings.obsession} 相手に対する執着心を示す。
    依存度: ${heroineSettings.dependency} 相手にどれだけ依存しているかを示す。
    友好度: ${heroineSettings.friendship} 相手との純粋な友情や信頼関係を示す。

    ユーザーの入力:
    ${userInput}

    有効なJSONのみを返してください。コードフェンスやマークダウン、追加のテキストは含めないでください。
    JSONの形式は次のようにしてください：
    {
      "scenes": [
        {
          "image": "/image/1734496403505.png",
          "text": "...",
          "dialogue": "...",
          "choices": ["..."]
        }
      ],
      "parameterChanges": {
        "likability": 5,
        "obsession": -3,
        "dependency": 2,
        "friendship": 4
      }
    }

    各フィールドの説明：
    - "scenes": 新しいシーンを含む配列。
      - "text": 現在のシーンや雰囲気を説明してください。ヒロインの行動、表情、設定の詳細などを含めてください。
      - "dialogue": ユーザーの入力に対するヒロインの直接的な応答を、彼女の性格に合った会話調で提供してください。ただしヒロインのセリフのみを出力してください。
      - "choices": ユーザーが次に取れる自然な行動や応答を4つ以上提供してください。会話や物語の流れに合った選択肢にしてください。
    - "parameterChanges": 各パラメータの変更値。増加は正の値、減少は負の値で示してください。
  `

  const promptMessages = [
    {
      role: "system",
      content: promptContent
    }
  ];

  const completion = await openai.chat.completions.create({
    model: "chatgpt-4o-latest", // モデル名を正しく設定
    messages: promptMessages,
    temperature: 0.7
  });

  let content = completion.choices[0].message?.content || ''
  // コードフェンスや```jsonなどを取り除くための正規表現処理
  content = content.replace(/```json|```/g, '').trim()

  let newScenes = []
  let parameterChanges = {}
  try {
    const parsed = JSON.parse(content)
    newScenes = parsed.scenes || []
    parameterChanges = parsed.parameterChanges || {}
  } catch (error) {
    console.error("Failed to parse JSON from LLM:", error)
    newScenes = [{
      image: '/image/1734496403505.png',
      text: 'エラーが発生しました。再度試して下さい。',
      dialogue: 'システム: JSONパースエラー',
      choices: ['やり直す']
    }]
    parameterChanges = {}
  }

  return NextResponse.json({ scenes: newScenes, parameterChanges })
}
