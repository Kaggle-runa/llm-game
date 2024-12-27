// app/final/page.tsx
'use client'

import { useEffect, useState, useContext, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { HeroineContext } from '@/context/HeroineContext'

export default function FinalPage() {
  const searchParams = useSearchParams()
  const likability = searchParams.get('likability')
  const obsession = searchParams.get('obsession')
  const dependency = searchParams.get('dependency')
  const friendship = searchParams.get('friendship')

  const { heroineSettings } = useContext(HeroineContext)

  const [generatedText, setGeneratedText] = useState<string>('')
  const [prompt, setPrompt] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // useRef を使用して一度だけAPIを呼び出すように制御
  const hasFetched = useRef(false)

  useEffect(() => {
    // APIが既に呼び出されたかどうかをチェック
    if (
      !hasFetched.current &&
      likability &&
      obsession &&
      dependency &&
      friendship &&
      heroineSettings 
    ) {
      hasFetched.current = true
      generateFinalStory(
        Number(likability),
        Number(obsession),
        Number(dependency),
        Number(friendship),
        heroineSettings
      )
    }
  }, [likability, obsession, dependency, friendship, heroineSettings])

  const generateFinalStory = async (
    likability: number,
    obsession: number,
    dependency: number,
    friendship: number,
    heroineSettings: {
      name: string
      appearance: string
      personality: string
    }
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/final', { // エンドポイントを修正
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          likability,
          obsession,
          dependency,
          friendship,
          heroineSettings,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate final story')
      }

      const data = await response.json()
      setGeneratedText(data.story)
      setPrompt(data.prompt)
      setImageUrl(data.imageUrl)
    } catch (err: any) {
      console.error('Error generating final story:', err)
      setError(err.message || 'Final story generation failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadImage = async () => {
    if (!imageUrl) return

    setIsDownloading(true)
    try {
      // サーバーサイドプロキシAPIを呼び出して画像を取得
      const response = await fetch('/api/download-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch image for download.')
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const { base64, mimeType } = data

      // Base64データを使用してデータURLを作成
      const link = document.createElement('a')
      link.href = `data:${mimeType};base64,${base64}`
      link.download = 'ending-image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error: any) {
      console.error('Error downloading image:', error)
      alert('画像のダウンロードに失敗しました。')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-r from-purple-500 to-pink-500 relative"
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay',
        backgroundColor: imageUrl ? 'rgba(255, 255, 255, 0.5)' : '',
      }}
    >
      {/* トップに戻るボタン */}
      <Link
        href="/"
        className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        aria-label="トップ画面に戻る"
      >
        <Home className="w-6 h-6 text-purple-500" />
      </Link>

      {/* メインコンテンツ */}
      <Card className="w-full max-w-5xl sm:max-w-4xl md:max-w-6xl p-8 bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl relative">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Spinner />
            <p className="mt-4 text-gray-700 text-lg">エンディングを生成中...</p>
          </div>
        ) : error ? (
          <div className="text-red-500">
            <p className="text-xl">エラー: {error}</p>
          </div>
        ) : (
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-center text-purple-600">エンディング</h1>
            <p className="text-gray-800 text-2xl sm:text-3xl leading-relaxed whitespace-pre-wrap">
              {generatedText}
            </p>
            {/* 画像保存ボタン */}
            {imageUrl && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  aria-label="エンディング画像を保存"
                  className={`px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors ${
                    isDownloading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDownloading ? '保存中...' : '画像を保存'}
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
