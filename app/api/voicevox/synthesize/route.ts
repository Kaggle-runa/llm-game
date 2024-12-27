// app/api/voicevox/synthesize/route.ts

import { NextRequest, NextResponse } from 'next/server'

// VOICEVOXのサーバーアドレス（必要に応じて変更）
const VOICEVOX_HOST = 'http://localhost:50021'

export async function POST(req: NextRequest) {
  try {
    const { text, speakerId = 3 } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'テキストが提供されていません。' }, { status: 400 })
    }

    // `text` をクエリパラメータとして追加
    const queryParams = new URLSearchParams({
      speaker: speakerId.toString(),
      text: text,
    })

    const queryResponse = await fetch(`${VOICEVOX_HOST}/audio_query?${queryParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // body は不要
    })

    console.log('audio_query APIレスポンスステータス:', queryResponse.status)
    console.log('audio_query APIレスポンスヘッダー:', queryResponse.headers)

    if (!queryResponse.ok) {
      const errorText = await queryResponse.text()
      console.error('audio_queryエラー内容:', errorText)
      throw new Error('VOICEVOXのaudio_queryエンドポイントへのリクエストに失敗しました。')
    }

    const query = await queryResponse.json()

    // 2. クエリを使用して音声を合成
    const synthesisResponse = await fetch(`${VOICEVOX_HOST}/synthesis?speaker=${speakerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    })

    console.log('synthesis APIレスポンスステータス:', synthesisResponse.status)
    console.log('synthesis APIレスポンスヘッダー:', synthesisResponse.headers)

    if (!synthesisResponse.ok) {
      const errorText = await synthesisResponse.text()
      console.error('synthesisエラー内容:', errorText)
      throw new Error('VOICEVOXのsynthesisエンドポイントへのリクエストに失敗しました。')
    }

    const audioBuffer = await synthesisResponse.arrayBuffer()

    // 3. 音声データをクライアントに返す
    return new NextResponse(Buffer.from(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
      },
    })
  } catch (error: any) {
    console.error('VOICEVOX音声生成エラー:', error)
    return NextResponse.json({ error: error.message || '音声生成中にエラーが発生しました。' }, { status: 500 })
  }
}
