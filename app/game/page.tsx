// app/game/page.tsx
'use client'

import { useState, useEffect, useContext, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Star, Sparkles, Home, Heart, Target, Handshake, EyeOff } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { HeroineContext } from '@/context/HeroineContext'
import useSound from '@/hooks/useSound'
import useVoiceSynthesis from '@/hooks/useVoiceSynthesis'
import { useRouter } from 'next/navigation'

interface HeroineSettings {
  name: string
  appearance: string
  personality: string
  speakerId: number
  likability: number
  obsession: number
  dependency: number
  friendship: number
}

interface Scene {
  image: string
  text: string
  dialogue: string
  choices: string[]
}

export default function Game() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [scenes, setScenes] = useState<Scene[]>([
    {
      image: '/image/image.png',
      text: '舞台は桜舞い散る春のある日。\n主人公（あなた）は転校初日を迎える高校生で、胸の高鳴りと不安が交錯している。',
      dialogue: '',
      choices: ['彼女を手助けする。', 'そのまま通り過ぎる。', '声をかけようか迷い、立ち止まる。', '黙って立ち去る'],
    },
  ])
  const { heroineSettings, setHeroineSettings, heroineImageUrl, setHeroineImageUrl } = useContext(HeroineContext)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  // 画像URLを管理するステート
  const [sceneImageUrl, setSceneImageUrl] = useState<string>(scenes[0].image)

  // 日数と残り回数を管理するステート
  const [dayNumber, setDayNumber] = useState(1)
  const [remainingActions, setRemainingActions] = useState(5)

  // 装飾用の星とキラキラのステート
  const [decorativeStars, setDecorativeStars] = useState<Array<any>>([])
  const [decorativeSparkles, setDecorativeSparkles] = useState<Array<any>>([])

  // ローディングステート
  const [isLoading, setIsLoading] = useState(false)

  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState('')
  const [displayedDialogue, setDisplayedDialogue] = useState('')

  // Refs to store timeouts
  const textTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dialogueTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // エラーステート
  const [error, setError] = useState<string | null>(null)

  // 効果音フックの使用
  const playClickSound = useSound('/audio/click.mp3') // 効果音ファイルのパスを指定

  // 音声合成フックの使用
  const { synthesizeSpeech } = useVoiceSynthesis()

  // 前回のパラメータ値を保存するステート
  const [prevHeroineSettings, setPrevHeroineSettings] = useState<HeroineSettings>(heroineSettings)

  // パラメータの変更を追跡するステート
  const [parameterChanges, setParameterChanges] = useState<Partial<Record<keyof HeroineSettings, number>>>({})

  // フィードバック用のステート
  const [highlightedParams, setHighlightedParams] = useState<Partial<Record<keyof HeroineSettings, 'increase' | 'decrease'>>>({})

  // ユーザー通知用のステート
  const [notification, setNotification] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    // 星とキラキラの装飾を一度だけ生成
    const stars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 2, // 2-5rem
      color: ['text-yellow-400', 'text-pink-400', 'text-purple-400', 'text-cyan-400'][Math.floor(Math.random() * 4)],
      animation: ['animate-pulse', 'animate-bounce', 'animate-spin'][Math.floor(Math.random() * 3)],
      delay: `${Math.random() * 5}s`,
    }))

    const sparkles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1.5, // 1.5-3.5rem
      color: ['text-yellow-400', 'text-pink-400', 'text-purple-400', 'text-cyan-400'][Math.floor(Math.random() * 4)],
      animation: ['animate-pulse', 'animate-bounce'][Math.floor(Math.random() * 2)],
      delay: `${Math.random() * 5}s`,
    }))

    setDecorativeStars(stars)
    setDecorativeSparkles(sparkles)
  }, [])

  useEffect(() => {
    if (scenes[currentSceneIndex]) {
      // 既存のタイムアウトをクリア
      if (textTimeoutRef.current) {
        clearTimeout(textTimeoutRef.current)
      }
      if (dialogueTimeoutRef.current) {
        clearTimeout(dialogueTimeoutRef.current)
      }

      setDisplayedText('')
      setDisplayedDialogue('')
      setSceneImageUrl(scenes[currentSceneIndex].image)

      // テキストのTypewriterエフェクト
      typewriter(
        scenes[currentSceneIndex].text,
        setDisplayedText,
        50,
        textTimeoutRef,
        () => {
          // ダイアログのTypewriterエフェクトと音声合成
          if (scenes[currentSceneIndex].dialogue) {
            handleDialogue(scenes[currentSceneIndex].dialogue)
          }
        }
      )
    }

    // クリーンアップ関数でタイムアウトをクリア
    return () => {
      if (textTimeoutRef.current) {
        clearTimeout(textTimeoutRef.current)
      }
      if (dialogueTimeoutRef.current) {
        clearTimeout(dialogueTimeoutRef.current)
      }
    }
  }, [currentSceneIndex, scenes])

  const typewriter = (
    fullText: string,
    setDisplayed: (text: string) => void,
    speed: number,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
    onComplete?: () => void
  ) => {
    let index = 0

    const addCharacter = () => {
      if (index < fullText.length) {
        const currentChar = fullText.charAt(index)
        setDisplayed((prev) => prev + currentChar)
        index++
        timeoutRef.current = setTimeout(addCharacter, speed)
      } else {
        if (onComplete) {
          onComplete()
        }
      }
    }

    addCharacter()
  }

  const [voiceError, setVoiceError] = useState<string | null>(null)

  const handleDialogue = async (dialogueText: string) => {
    // 音声合成を実行
    const { audioBlob, error } = await synthesizeSpeech(dialogueText, heroineSettings.speakerId) 

    if (error) {
      setVoiceError(error)
    }

    if (audioBlob) {
      // 音声を再生
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      const startTyping = () => {
        const audioDuration = audio.duration || 3 // デフォルト3秒
        const totalChars = dialogueText.length
        const calculatedSpeed = (audioDuration * 1000) / totalChars // ms/char

        typewriter(
          dialogueText,
          setDisplayedDialogue,
          calculatedSpeed,
          dialogueTimeoutRef,
          () => {
            // タイピング完了後にオーディオオブジェクトをクリーンアップ
            URL.revokeObjectURL(audioUrl)
          }
        )
      }

      audio.addEventListener('loadedmetadata', startTyping)
      audio.play().catch((error) => {
        setVoiceError('音声の再生に失敗しました。テキストのみを表示します。')
        startTyping()
      })
    } else if (error) {
      // 音声合成に失敗した場合、通常のタイピングを行う
      typewriter(
        dialogueText,
        setDisplayedDialogue,
        50,
        dialogueTimeoutRef
      )
    }
  }

  // 残り回数を減らす関数
  const decrementRemainingActions = () => {
    setRemainingActions((prev) => Math.max(prev - 1, 0))
  }

  // remainingActions が0になったら dayNumber を増やし、remainingActions をリセットする
  useEffect(() => {
    if (remainingActions === 0) {
      setDayNumber((day) => day + 1)
      setRemainingActions(10) // 新しい日数に応じた回数にリセット

      // 遷移先のURLにパラメータを渡して遷移
      const query = new URLSearchParams({
        likability: String(heroineSettings.likability),
        obsession: String(heroineSettings.obsession),
        dependency: String(heroineSettings.dependency),
        friendship: String(heroineSettings.friendship),
      }).toString()

      router.push(`/final?${query}`)
    }
  }, [remainingActions, heroineSettings, router])

  const handleChoice = async (choice: string) => {
    if (isLoading) return

    // 効果音を再生
    playClickSound()

    // 選択肢を入力として設定し、handleInputSubmitを呼び出す
    await handleInputSubmit(choice)
  }

  const handleInputSubmit = async (input?: string) => {
    if (isLoading) return

    // 効果音を再生
    playClickSound()

    // 選択肢からの入力かフォームからの入力かを判断
    const submission = input || userInput.trim()
    if (!submission) return

    setIsLoading(true)
    setError(null)

    try {
      console.log(`ユーザー入力: ${submission}`)
      console.log('ヒロイン設定', heroineSettings)
      console.log('過去のシーン', scenes)

      // 1. LLMへのリクエスト
      const llmResponse = await fetch('/api/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: submission,
          currentScene: scenes[currentSceneIndex],
          heroineSettings: heroineSettings,
          scenes: scenes, // 過去のシーンを追加
        }),
      })

      if (!llmResponse.ok) {
        throw new Error('Failed to fetch from LLM API')
      }

      const llmData = await llmResponse.json()
      console.log('LLMからのデータ:', llmData) // デバッグログ

      if (llmData.scenes && Array.isArray(llmData.scenes)) {
        // 新しいシーンを既存のシーンに追加
        setScenes((prevScenes) => [...prevScenes, ...llmData.scenes])
        setCurrentSceneIndex((prevIndex) => prevIndex + 1) // 次のシーンに移動
        console.log('シーンが追加されました。最新のシーン:', llmData.scenes[llmData.scenes.length - 1]) // デバッグログ
      } else {
        console.warn('LLMからのシーンデータが不正です。')
      }

      // 2. パラメータの変更を処理
      if (llmData.parameterChanges) {
        const updatedSettings = { ...heroineSettings }
        const changes: Partial<Record<keyof HeroineSettings, number>> = {}

        for (const [key, value] of Object.entries(llmData.parameterChanges)) {
          if (key in updatedSettings && typeof value === 'number') {
            const paramKey = key as keyof HeroineSettings
            const newValue = Math.min(100, Math.max(0, updatedSettings[paramKey] + value))
            changes[paramKey] = value
            updatedSettings[paramKey] = newValue
          }
        }

        // パラメータの増減を保存
        setParameterChanges(changes)

        // HeroineContextを更新
        setHeroineSettings(updatedSettings)
        setPrevHeroineSettings(heroineSettings)

        // ユーザー通知を設定
        const notifications = Object.entries(changes).map(([key, value]) => {
          const paramName = getParameterName(key as keyof HeroineSettings)
          const change = value > 0 ? `+${value}` : `${value}`
          return `${paramName}が${change}変化しました`
        }).join('、 ')

        setNotification(notifications)
      }

      // 3. 画像生成リクエスト（必要に応じてコメント解除）
      // 現在はコメントアウトされていますが、必要に応じて以下のコードを有効化してください。
      
      const imgResponse = await fetch('/api/image-dalle-3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `masterpiece, best quality, solo, a very cute and beautiful anime girl, very high quality clear anime eyes, single character, a heroine named ${heroineSettings.name}, ${heroineSettings.appearance}, ${heroineSettings.personality}. A scene described as: ${llmData.scenes[llmData.scenes.length - 1].text} and hero says: ${llmData.scenes[llmData.scenes.length - 1].dialogue}`,
        }),
      })
      if (!imgResponse.ok) {
        throw new Error('Failed to fetch from Image API')
      }

      const imgData = await imgResponse.json()
      console.log(`プロンプト: A scene described as: ${llmData.scenes[llmData.scenes.length - 1].text} and hero says: ${llmData.scenes[llmData.scenes.length - 1].dialogue}`)
      console.log('画像生成の結果:', imgData) // デバッグログ

      if (imgData.imageUrl) {
        setSceneImageUrl(imgData.imageUrl)
        localStorage.setItem('sceneImageUrl', imgData.imageUrl)
        console.log('画像URLが更新されました:', imgData.imageUrl) // デバッグログ
      }
      
    } catch (error: any) {
      console.error('Error updating scenes or generating image:', error)
      // エラーハンドリングを追加（例：ユーザーに通知）
      setError(error.message || 'シーンの生成中にエラーが発生しました。')
    }

    // 入力フォームをクリア（選択肢からの入力の場合は不要）
    if (!input) {
      setUserInput('')
    }

    // 残り回数を減らす
    decrementRemainingActions()

    setIsLoading(false)
  }

  // パラメータキーから日本語名を取得する関数
  const getParameterName = (key: keyof HeroineSettings): string => {
    switch (key) {
      case 'likability':
        return '好感度'
      case 'obsession':
        return '執着度'
      case 'dependency':
        return '依存度'
      case 'friendship':
        return '友好度'
      default:
        return key
    }
  }

  useEffect(() => {
    if (Object.keys(parameterChanges).length > 0) {
      const newHighlights: Partial<Record<keyof HeroineSettings, 'increase' | 'decrease'>> = {}
      for (const [key, value] of Object.entries(parameterChanges)) {
        if (value > 0) {
          newHighlights[key as keyof HeroineSettings] = 'increase'
        } else if (value < 0) {
          newHighlights[key as keyof HeroineSettings] = 'decrease'
        }
      }
      setHighlightedParams(newHighlights)

      // 一定時間後にハイライトをリセット
      const timeout = setTimeout(() => {
        setHighlightedParams({})
      }, 2000) // 2秒間ハイライト

      return () => clearTimeout(timeout)
    }
  }, [parameterChanges])

  useEffect(() => {
    if (notification) {
      const timeout = setTimeout(() => {
        setNotification(null)
      }, 3000) // 3秒後に通知を非表示
      return () => clearTimeout(timeout)
    }
  }, [notification])

  return (
    <div className="splash-bg flex flex-col min-h-screen p-4 relative overflow-hidden">
      {/* ヘッダーセクション */}
      <header className="flex justify-between items-center mb-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg relative z-20">
        {/* トップに戻るボタン */}
        <Link href="/" className="bg-white rounded-full p-2 hover:scale-105 transition-transform">
          <Home className="h-6 w-6 text-purple-500" />
        </Link>

        {/* 日数と残り回数のテキスト */}
        <div className="flex items-center space-x-4">
          {/* 日数アイコン */}
          <div className="bg-white rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {/* 日数テキスト */}
          <p className="text-lg font-semibold text-white">
            <span className="text-2xl font-bold">{dayNumber}</span>日目
          </p>
          {/* 残り回数アイコン */}
          <div className="bg-white rounded-full p-2 ml-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {/* 残り回数テキスト */}
          <p className="text-lg font-semibold text-white">
            本日のやり取り回数はあと<span className="text-2xl font-bold">{remainingActions}</span>回
          </p>
        </div>
      </header>

      {/* ユーザー通知 */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-200 text-green-800 px-4 py-2 rounded-lg shadow-lg animate-fade-in-out z-50">
          {notification}
        </div>
      )}

      {/* エラーメッセージ表示 */}
      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded-lg relative z-20 text-lg">
          {error}
        </div>
      )}

      {/* ローディングインジケーター */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Spinner /> {/* ローディングスピナーコンポーネント */}
        </div>
      )}

      {/* 装飾要素 - ランダムな星とキラキラ */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {decorativeStars.map((star) => (
          <Star
            key={`star-${star.id}`}
            className={`absolute ${star.color} ${star.animation}`}
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}rem`,
              height: `${star.size}rem`,
              animationDelay: star.delay,
              opacity: 0.7,
            }}
          />
        ))}
        {decorativeSparkles.map((sparkle) => (
          <Sparkles
            key={`sparkle-${sparkle.id}`}
            className={`absolute ${sparkle.color} ${sparkle.animation}`}
            style={{
              top: sparkle.top,
              left: sparkle.left,
              width: `${sparkle.size}rem`,
              height: `${sparkle.size}rem`,
              animationDelay: sparkle.delay,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* 画像周りの追加の装飾 */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <Star className="absolute top-[5%] left-[5%] text-yellow-400 w-8 h-8 animate-pulse" />
        <Sparkles className="absolute top-[8%] right-[5%] text-pink-400 w-6 h-6 animate-bounce" />
        <Star className="absolute bottom-[5%] left-[8%] text-purple-400 w-7 h-7 animate-spin" />
        <Sparkles className="absolute bottom-[7%] right-[8%] text-cyan-400 w-5 h-5 animate-pulse" />
      </div>

      <div className="flex flex-1 p-2 relative z-20">
        {/* 左側の選択肢欄 */}
        <Card className="w-1/4 p-2 space-y-2 bg-white/80 backdrop-blur-sm border-primary shadow-lg rounded-2xl mr-2 flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
          {/* キラキラエフェクト */}
          <div className="absolute top-2 right-2">
            <Sparkles className="text-yellow-400 w-4 h-4 animate-pulse" />
          </div>
          <div className="absolute bottom-2 left-2">
            <Star className="text-pink-400 w-4 h-4 animate-bounce" />
          </div>
          {scenes[currentSceneIndex]?.choices?.map((choice, index) => (
            <Button
              key={index}
              className={`w-full rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 text-gray-800 hover:opacity-90 transition-all duration-300 text-lg relative z-10 ${isLoading || remainingActions === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleChoice(choice)}
              disabled={isLoading || remainingActions === 0}
            >
              {choice}
            </Button>
          ))}

          {/* ヒロインの設定表示セクション */}
          <Card className="mt-4 p-6 bg-white/90 backdrop-blur-sm border-primary shadow-lg rounded-xl flex flex-col space-y-6">
            <h2 className="text-4xl font-bold text-center text-purple-600">ヒロインの設定</h2>
            <div className="flex flex-col space-y-2">
              {/* 名前 */}
              <p className="text-2xl">
                <span className="font-semibold text-3xl">名前:</span> <span className="text-3xl">{heroineSettings.name || '未設定'}</span>
              </p>
              {/* 外見 */}
              <p className="text-2xl">
                <span className="font-semibold text-3xl">外見:</span> <span className="text-3xl">{heroineSettings.appearance || '未設定'}</span>
              </p>
              {/* 性格 */}
              <p className="text-2xl">
                <span className="font-semibold text-3xl">性格:</span> <span className="text-3xl">{heroineSettings.personality || '未設定'}</span>
              </p>
            </div>
            {/* ヒロインの立ち絵表示 */}
            {heroineImageUrl ? (
              <div className="mt-4 flex justify-center">
                <Image
                  src={heroineImageUrl}
                  alt="ヒロインの立ち絵"
                  width={450}
                  height={450}
                  className="rounded-full shadow-lg"
                />
              </div>
            ) : (
              <div className="mt-4 flex justify-center">
                <Spinner />
              </div>
            )}

            {/* 新しく追加するパラメータのCard */}
            <Card className="mt-6 p-6 bg-white/90 backdrop-blur-sm border-primary shadow-lg rounded-xl flex flex-col space-y-6">
              <h3 className="text-4xl font-bold text-center text-pink-600">ヒロインのパラメータ</h3>
              
              {/* 好感度 */}
              <div className={`flex items-center space-x-4 transition-colors duration-500 ${highlightedParams.likability === 'increase' ? 'bg-green-100' : highlightedParams.likability === 'decrease' ? 'bg-red-100' : ''} rounded-lg p-2`}>
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-semibold text-2xl">好感度:</p>
                  <p className="text-2xl">{heroineSettings.likability}</p>
                </div>
              </div>
              
              {/* 執着度 */}
              <div className={`flex items-center space-x-4 transition-colors duration-500 ${highlightedParams.obsession === 'increase' ? 'bg-green-100' : highlightedParams.obsession === 'decrease' ? 'bg-red-100' : ''} rounded-lg p-2`}>
                <Target className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-semibold text-2xl">執着度:</p>
                  <p className="text-2xl">{heroineSettings.obsession}</p>
                </div>
              </div>
              
              {/* 依存度 */}
              <div className={`flex items-center space-x-4 transition-colors duration-500 ${highlightedParams.dependency === 'increase' ? 'bg-green-100' : highlightedParams.dependency === 'decrease' ? 'bg-red-100' : ''} rounded-lg p-2`}>
                <EyeOff className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-semibold text-2xl">依存度:</p>
                  <p className="text-2xl">{heroineSettings.dependency}</p>
                </div>
              </div>
              
              {/* 友好度 */}
              <div className={`flex items-center space-x-4 transition-colors duration-500 ${highlightedParams.friendship === 'increase' ? 'bg-green-100' : highlightedParams.friendship === 'decrease' ? 'bg-red-100' : ''} rounded-lg p-2`}>
                <Handshake className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="font-semibold text-2xl">友好度:</p>
                  <p className="text-2xl">{heroineSettings.friendship}</p>
                </div>
              </div>
            </Card>
          </Card>
        </Card>

        {/* 右側のメインコンテンツ */}
        <div className="flex flex-col flex-1">
          <div className="flex-1 flex flex-col gap-2 mb-2">
            {/* 画像表示部分 */}
            <Card className="flex-1 p-2 bg-white/80 backdrop-blur-sm border-primary shadow-lg rounded-2xl flex items-center justify-center relative overflow-hidden">
              {/* 画像の周りの装飾的な光彩効果 */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 animate-gradient" />
                <div className="absolute top-2 left-2 right-2 bottom-2 border-2 border-white/30 rounded-xl" />
              </div>

              {/* コーナーの装飾 - より大きく派手に */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-pink-400">
                <Star className="absolute -top-2 -left-2 text-pink-400 w-4 h-4 animate-pulse" />
              </div>
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400">
                <Sparkles className="absolute -top-2 -right-2 text-cyan-400 w-4 h-4 animate-bounce" />
              </div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-purple-400">
                <Star className="absolute -bottom-2 -left-2 text-purple-400 w-4 h-4 animate-spin" />
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-yellow-400">
                <Sparkles className="absolute -bottom-2 -right-2 text-yellow-400 w-4 h-4 animate-pulse" />
              </div>

              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={sceneImageUrl} // heroineImageUrl ではなく sceneImageUrl を使用
                  alt="シーン"
                  fill
                  className="object-contain rounded-xl shadow-lg"
                />
              </div>
            </Card>

            {/* セリフ表示部分 */}
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-primary shadow-lg rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10" />
              {/* 装飾的な星を追加 */}
              <Star className="absolute top-2 right-2 text-yellow-400 w-4 h-4 animate-pulse" />
              <Sparkles className="absolute bottom-2 left-2 text-pink-400 w-4 h-4 animate-bounce" />
              <p
                className="text-base mb-2 text-secondary relative z-10"
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: displayedText.replace(/\n/g, '<br />') }}
              ></p>
              <p
                className="text-lg font-semibold bg-gradient-to-r from-secondary to-accent inline-block text-transparent bg-clip-text relative z-10"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {displayedDialogue}
              </p>
            </Card>
          </div>

          {/* テキスト入力欄 */}
          <Card className="p-2 bg-white/80 backdrop-blur-sm border-primary shadow-lg rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10" />
            {/* 装飾的な星を追加 */}
            <Star className="absolute top-2 right-2 text-purple-400 w-3 h-3 animate-spin" />
            <Sparkles className="absolute bottom-2 left-2 text-cyan-400 w-3 h-3 animate-pulse" />
            <form onSubmit={(e) => { e.preventDefault(); handleInputSubmit(); }} className="flex gap-2 relative z-10">
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="ここにテキストを入力してください..."
                className="flex-1 rounded-xl border-primary focus:ring-secondary text-lg"
                aria-label="ユーザー入力"
              />
              <Button 
                type="submit"
                className={`rounded-xl bg-gradient-to-r from-pink-400 to-secondary text-white hover:opacity-90 transition-all duration-300 text-lg px-4 ${userInput.trim() === '' || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={userInput.trim() === '' || isLoading}
              >
                送信
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* アニメーション用のスタイル */}
      <style jsx global>{
        `
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        /* カスタムアニメーション */
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        /* ユーザー通知のフェードイン・アウトアニメーション */
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-20px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s forwards;
        }
        `
      }</style>
    </div>
  )
}
