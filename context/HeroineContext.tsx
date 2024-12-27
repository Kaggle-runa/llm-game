// app/context/HeroineContext.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface HeroineSettings {
  name: string;
  appearance: string;
  personality: string;
  speakerId: number;
  likability: number;  // 好感度
  obsession: number;   // 執着度
  dependency: number;  // 依存度
  friendship: number;  // 友好度
}

interface HeroineContextProps {
  heroineSettings: HeroineSettings;
  setHeroineSettings: (settings: HeroineSettings) => void;
  heroineImageUrl: string | null;
  setHeroineImageUrl: (url: string) => void;
}

const defaultSettings: HeroineSettings = {
  name: '',
  appearance: '',
  personality: '',
  speakerId: 3, // デフォルトのスピーカーID（例: ずんだもん）
  likability: 20,
  obsession: 20,
  dependency: 20,
  friendship: 20,
};

export const HeroineContext = createContext<HeroineContextProps>({
  heroineSettings: defaultSettings,
  setHeroineSettings: () => {},
  heroineImageUrl: null,
  setHeroineImageUrl: () => {},
});

export const HeroineProvider = ({ children }: { children: ReactNode }) => {
  const [heroineSettings, setHeroineSettings] = useState<HeroineSettings>(defaultSettings);
  const [heroineImageUrl, setHeroineImageUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('heroineSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // データのバリデーション
        if (
          typeof parsedSettings.name === 'string' &&
          typeof parsedSettings.appearance === 'string' &&
          typeof parsedSettings.personality === 'string' &&
          typeof parsedSettings.speakerId === 'number' &&
          typeof parsedSettings.likability === 'number' &&
          typeof parsedSettings.obsession === 'number' &&
          typeof parsedSettings.dependency === 'number' &&
          typeof parsedSettings.friendship === 'number'
        ) {
          setHeroineSettings(parsedSettings);
        } else {
          console.warn('Invalid heroineSettings format in localStorage. Using default settings.');
        }
      }

      const savedHeroineImageUrl = localStorage.getItem('heroineImageUrl');
      if (savedHeroineImageUrl) {
        setHeroineImageUrl(savedHeroineImageUrl);
      }
    } catch (error) {
      console.error('Error loading heroine settings from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    // 設定が変更されたらlocalStorageに保存
    localStorage.setItem('heroineSettings', JSON.stringify(heroineSettings));
  }, [heroineSettings]);

  useEffect(() => {
    console.log('Current Heroine Settings:', heroineSettings);
  }, [heroineSettings]);

  return (
    <HeroineContext.Provider
      value={{
        heroineSettings,
        setHeroineSettings,
        heroineImageUrl,
        setHeroineImageUrl,
      }}
    >
      {children}
    </HeroineContext.Provider>
  );
};
