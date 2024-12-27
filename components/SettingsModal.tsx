// components/SettingsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button';
import { Select } from '@/components/Select'; 

interface HeroineSettings {
  name: string;
  appearance: string;
  personality: string;
  speakerId: number;
  likability: number;
  obsession: number;
  dependency: number;
  friendship: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: HeroineSettings) => void;
  initialSettings: HeroineSettings;
}

const speakerOptions = [
  { label: '四国めたん:「クレジット表記_VOICEVOX:四国めたん」', value: 0 },
  { label: 'ずんだもん:「クレジット表記_VOICEVOX:ずんだもん」', value: 3 },
  { label: '春日部つむぎ:「クレジット表記_VOICEVOX:春日部つむぎ」', value: 8 },
  { label: '雨晴はう:「クレジット表記_VOICEVOX:雨晴はう」', value: 10 },
  { label: '冥鳴ひまり:「クレジット表記_VOICEVOX冥鳴ひまり」', value: 14 },
  { label: 'もち子さん:「クレジット表記_VOICEVOX:もち子さん」', value: 20 },
  { label: 'WhiteCUL:「クレジット表記_VOICEVOX:WhiteCUL」', value: 23 },
  { label: 'ナースロボ＿タイプＴ:「クレジット表記_VOICEVOX:ナースロボ＿タイプＴ」', value: 47 },
  { label: '中国うさぎ:「クレジット表記_VOICEVOX:中国うさぎ」', value: 61 },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings,
}) => {
  const [settings, setSettings] = useState<HeroineSettings>({
    name: '',
    appearance: '',
    personality: '',
    speakerId: 3,
    likability: 20,
    obsession: 20,
    dependency: 20,
    friendship: 20,
  });

  useEffect(() => {
    if (isOpen) {
      setSettings(initialSettings);
    }
  }, [isOpen, initialSettings]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleSliderChange = (field: keyof HeroineSettings, value: number) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-white/90 backdrop-blur-sm border-primary rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-secondary">ヒロイン設定</DialogTitle>
          <DialogDescription className="text-accent">
            ヒロインの名前、容姿、性格、その他のパラメータを設定してください。
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* 名前 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-secondary">
              名前
            </Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="col-span-3 border-primary focus:ring-secondary"
              placeholder="ヒロインの名前"
              required
            />
          </div>

          {/* 外見 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="appearance" className="text-right text-secondary">
              外見
            </Label>
            <Textarea
              id="appearance"
              value={settings.appearance}
              onChange={(e) => setSettings({ ...settings, appearance: e.target.value })}
              className="col-span-3 border-primary focus:ring-secondary"
              placeholder="髪型、目の色、服装など"
            />
          </div>

          {/* 性格 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="personality" className="text-right text-secondary">
              性格
            </Label>
            <Textarea
              id="personality"
              value={settings.personality}
              onChange={(e) => setSettings({ ...settings, personality: e.target.value })}
              className="col-span-3 border-primary focus:ring-secondary"
              placeholder="明るい、優しい、ツンデレなど"
            />
          </div>

          {/* スピーカー */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="speaker" className="text-right text-secondary">
              スピーカー
            </Label>
            <Select
              id="speaker"
              options={speakerOptions}
              value={settings.speakerId}
              onChange={(value) => setSettings({ ...settings, speakerId: value })}
              placeholder="スピーカーを選択"
              className="col-span-3 w-full border-primary focus:ring-secondary"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="likability" className="text-right text-secondary">
              好感度
            </Label>
            <input
              type="range"
              id="likability"
              min="0"
              max="100"
              value={settings.likability}
              onChange={(e) => handleSliderChange('likability', Number(e.target.value))}
              className="col-span-3 w-full"
            />
            <span className="col-span-4 text-center text-sm text-gray-700">{settings.likability}</span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="obsession" className="text-right text-secondary">
              執着度
            </Label>
            <input
              type="range"
              id="obsession"
              min="0"
              max="100"
              value={settings.obsession}
              onChange={(e) => handleSliderChange('obsession', Number(e.target.value))}
              className="col-span-3 w-full"
            />
            <span className="col-span-4 text-center text-sm text-gray-700">{settings.obsession}</span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dependency" className="text-right text-secondary">
              依存度
            </Label>
            <input
              type="range"
              id="dependency"
              min="0"
              max="100"
              value={settings.dependency}
              onChange={(e) => handleSliderChange('dependency', Number(e.target.value))}
              className="col-span-3 w-full"
            />
            <span className="col-span-4 text-center text-sm text-gray-700">{settings.dependency}</span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="friendship" className="text-right text-secondary">
              友好度
            </Label>
            <input
              type="range"
              id="friendship"
              min="0"
              max="100"
              value={settings.friendship}
              onChange={(e) => handleSliderChange('friendship', Number(e.target.value))}
              className="col-span-3 w-full"
            />
            <span className="col-span-4 text-center text-sm text-gray-700">{settings.friendship}</span>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={
              !settings.name ||
              !settings.appearance ||
              !settings.personality ||
              settings.likability < 0 ||
              settings.likability > 100 ||
              settings.obsession < 0 ||
              settings.obsession > 100 ||
              settings.dependency < 0 ||
              settings.dependency > 100 ||
              settings.friendship < 0 ||
              settings.friendship > 100
            }
            className="bg-gradient-to-r from-pink-400 to-secondary text-white hover:opacity-90 transition-all duration-300 rounded-xl"
          >
            設定を保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
