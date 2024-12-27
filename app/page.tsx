// app/page.tsx
'use client'

import { useState, useContext, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Star, Mic, MicOff } from 'lucide-react'; // Micアイコンをインポート
import { SettingsModal } from '@/components/SettingsModal';
import { Spinner } from '@/components/ui/spinner';
import { HeroineContext } from '@/context/HeroineContext';
import { useRouter } from 'next/navigation';
import useSound from '@/hooks/useSound'; 


interface HeroineSettings {
  name: string;
  appearance: string;
  personality: string;
  speakerId: number; 
}

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { heroineSettings, setHeroineSettings, setHeroineImageUrl } = useContext(HeroineContext);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // 初期ロードの状態を管理する
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 音楽再生用のリファレンス
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.5); // 初期音量を50%に設定
  const [isMuted, setIsMuted] = useState(false); // ミュート状態
  const [isPlaying, setIsPlaying] = useState(false); // 音楽再生状態

  // 効果音フックの使用
  const playClickSound = useSound('/audio/click.mp3'); // 効果音ファイルのパスを指定

  // HeroineContext が既に画像URLを持っているか確認
  useEffect(() => {
    // 初期ロード時に HeroineContext の設定を確認
    const savedSettings = localStorage.getItem('heroineSettings');
    if (savedSettings) {
      setHeroineSettings(JSON.parse(savedSettings));
    }
    setInitialLoad(false);

    // オーディオオブジェクトを初期化
    audioRef.current = new Audio('/audio/music.mp3'); // 音楽ファイルのパスを指定
    audioRef.current.loop = true; // ループ再生
    audioRef.current.volume = volume;

    // クリーンアップ
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [setHeroineSettings]);

  // 音量が変更されたときにオーディオオブジェクトに反映
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleSaveSettings = (settings: HeroineSettings) => {
    setHeroineSettings(settings);
    localStorage.setItem('heroineSettings', JSON.stringify(settings));
    console.log('保存された設定:', settings);
  };

  const handleStartGame = async () => {
    // 効果音を再生
    playClickSound();

    // ヒロイン設定が未入力の場合はエラーを表示
    console.log('ヒロイン設定', heroineSettings);
    if (!heroineSettings.name || !heroineSettings.appearance || !heroineSettings.personality) {
      setError('すべてのヒロイン設定項目を入力してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `masterpiece, best quality, solo, a very cute and beautiful anime girl, very high quality clear anime eyes, single character, a heroine named ${heroineSettings.name}, ${heroineSettings.appearance}, ${heroineSettings.personality}.`;

      const imgResponse = await fetch('/api/image-dalle-3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      console.log('Image generation API called');

      if (!imgResponse.ok) {
        throw new Error('Failed to fetch from Image API');
      }

      const imgData = await imgResponse.json();
      if (imgData.imageUrl) {
        // 生成された画像URLをlocalStorageとコンテキストに保存
        localStorage.setItem('heroineImageUrl', imgData.imageUrl);
        setHeroineImageUrl(imgData.imageUrl);
      } else {
        throw new Error('Image URL not found in response');
      }

      // ゲーム画面に移動
      router.push('/game');
    } catch (error: any) {
      console.error('Error generating heroine image:', error);
      setError(error.message || 'ヒロインの立ち絵生成中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // 音量調整ボタンのハンドラー
  const handleVolumeChange = async () => {
    if (!isPlaying) {
      // 音楽が再生されていない場合、再生を試みる
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("音楽の再生に失敗しました:", error);
          return;
        }
      }
    }

    if (isMuted) {
      // ミュート解除時に音量を元に戻す
      setIsMuted(false);
      if (audioRef.current) {
        audioRef.current.muted = false;
      }
      setVolume(0.5); // 音量をデフォルト値（例: 0.5）に戻す
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
      }
    } else {
      // 音量を下げる。ここでは例として0.1ずつ減らす
      setVolume((prevVolume) => {
        const newVolume = Math.max(prevVolume - 0.1, 0);
        if (newVolume === 0) {
          // 音量が0になったらミュート状態にする
          setIsMuted(true);
          if (audioRef.current) {
            audioRef.current.muted = true;
          }
        }
        if (audioRef.current) {
          audioRef.current.volume = newVolume;
        }
        return newVolume;
      });
    }
  };


  return (
    <div className="splash-bg flex flex-col items-center justify-start min-h-screen relative overflow-hidden pt-24">
      {/* 全画面表示の top.png */}
      <Image
        src="/image/top.png" // top.png のパスを指定
        alt="Top Background"
        fill // layout="fill" の代わりに fill プロパティを使用
        className="absolute top-0 left-0 w-full h-full opacity-50 z-0 object-cover" // objectFit="cover" の代わりに object-cover クラスを追加
        quality={100}
      />

      {/* 装飾的な星 */}
      <Star className="absolute text-yellow-400 w-6 h-6" style={{ top: '20%', left: '20%' }} />
      <Star className="absolute text-yellow-400 w-4 h-4" style={{ top: '30%', right: '25%' }} />
      <Star className="absolute text-yellow-400 w-5 h-5" style={{ bottom: '25%', left: '30%' }} />

      {/* タイトル画像 */}
      <div className="mb-12 z-10 mt-8"> {/* mt-8 を追加 */}
        <Image
          src="/image/1734496403505.png"
          alt="無垢なAIしてる"
          width={800}
          height={300}
          className="drop-shadow-lg"
        />
      </div>

      {/* エラーメッセージ表示 */}
      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded-lg z-10">
          {error}
        </div>
      )}

      {/* ボタン群 */}
      <div className="flex flex-col items-center space-y-4 z-10 mt-8"> {/* mt-8 を追加 */}
        {/* ゲームを始めるボタン */}
        <Button
          onClick={handleStartGame}
          className="text-lg px-8 py-4 rounded-full bg-gradient-to-r from-pink-400 to-secondary text-white hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || initialLoad}
        >
          {isLoading || initialLoad ? <Spinner /> : 'ゲームを始める'}
        </Button>

        {/* ヒロイン設定ボタン */}
        <Button
          onClick={() => {
            // 効果音を再生
            playClickSound();
            setIsSettingsOpen(true);
          }}
          className="text-lg px-8 py-4 rounded-full bg-gradient-to-r from-pink-300 to-secondary text-white hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          ヒロイン設定
        </Button>
      </div>

      {/* 音量調整ボタン */}
      <div className="absolute bottom-6 right-6 z-10">
        <Button
          onClick={handleVolumeChange}
          className="flex items-center p-4 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-opacity duration-300 shadow-lg text-gray-700 text-lg font-semibold"
        >
          {isMuted || volume === 0 ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
          <span className="ml-2">Volume</span> {/* テキストを追加 */}
        </Button>
      </div>

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialSettings={heroineSettings} // 追加
      />
    </div>
  );
}
