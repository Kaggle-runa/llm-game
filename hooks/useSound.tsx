// hooks/useSound.ts
import { useCallback } from 'react';

const useSound = (soundFile: string) => {
  const playSound = useCallback(() => {
    const audio = new Audio(soundFile);
    audio.play().catch((error) => {
      console.error('音声再生エラー:', error);
    });
  }, [soundFile]);

  return playSound;
};

export default useSound;
