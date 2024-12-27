// hooks/useVoiceSynthesis.ts

import { useCallback } from 'react'

const useVoiceSynthesis = () => {
  const synthesizeSpeech = useCallback(async (text: string, speakerId: number): Promise<{ audioBlob: Blob | null, error?: string }> => {
    try {
      const cacheKey = `voicevox_${speakerId}_${text}`
      const cachedAudio = localStorage.getItem(cacheKey)
      if (cachedAudio) {
        return { audioBlob: new Blob([Uint8Array.from(atob(cachedAudio), c => c.charCodeAt(0))], { type: 'audio/wav' }) }
      }

      const response = await fetch('/api/voicevox/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, speakerId }), // speakerIdを含める
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '音声合成に失敗しました。')
      }

      const audioBlob = await response.blob()
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)

      return { audioBlob }
    } catch (error: any) {
      console.error('音声合成エラー:', error)
      return { audioBlob: null, error: error.message || '音声合成中にエラーが発生しました。' }
    }
  }, [])

  return { synthesizeSpeech }
}

export default useVoiceSynthesis

