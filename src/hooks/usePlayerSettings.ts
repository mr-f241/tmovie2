import { useState, useEffect, useCallback } from 'react';
import { secureStorage } from '@/lib/crypto';

interface PlayerSettings {
  playbackSpeed: number;
  volume: number;
  muted: boolean;
  autoplay: boolean;
  autoNext: boolean;
  quality: 'auto' | '1080p' | '720p' | '480p' | '360p';
}

const SETTINGS_KEY = 'player_settings';

const defaultSettings: PlayerSettings = {
  playbackSpeed: 1,
  volume: 1,
  muted: false,
  autoplay: true,
  autoNext: true,
  quality: 'auto',
};

export const usePlayerSettings = () => {
  const [settings, setSettings] = useState<PlayerSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = secureStorage.get<PlayerSettings>(SETTINGS_KEY, defaultSettings);
    setSettings({ ...defaultSettings, ...stored });
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      secureStorage.set(SETTINGS_KEY, settings);
    }
  }, [settings, isLoaded]);

  const updateSetting = useCallback(<K extends keyof PlayerSettings>(
    key: K,
    value: PlayerSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    isLoaded,
    updateSetting,
    resetSettings,
  };
};

// Keyboard shortcuts for player
export const PLAYER_SHORTCUTS = {
  PLAY_PAUSE: ' ',
  SEEK_FORWARD: 'ArrowRight',
  SEEK_BACKWARD: 'ArrowLeft',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  MUTE: 'm',
  FULLSCREEN: 'f',
  SPEED_UP: '>',
  SPEED_DOWN: '<',
  NEXT_EPISODE: 'n',
  PREV_EPISODE: 'p',
} as const;
