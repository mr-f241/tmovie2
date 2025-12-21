import { useState, useEffect, useCallback } from 'react';
import { secureStorage } from '@/lib/crypto';
import type { Movie } from '@/types/movie';

export interface WatchHistoryItem {
  slug: string;
  name: string;
  posterUrl: string;
  episodeSlug: string;
  episodeName: string;
  progress: number; // 0-100 percentage
  timestamp: number;
  duration?: number;
}

const HISTORY_KEY = 'watch_history';
const MAX_HISTORY_ITEMS = 50;

export const useWatchHistory = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history on mount
  useEffect(() => {
    const stored = secureStorage.get<WatchHistoryItem[]>(HISTORY_KEY, []);
    setHistory(stored);
    setIsLoaded(true);
  }, []);

  // Save to storage when history changes
  useEffect(() => {
    if (isLoaded) {
      secureStorage.set(HISTORY_KEY, history);
    }
  }, [history, isLoaded]);

  const addToHistory = useCallback((item: Omit<WatchHistoryItem, 'timestamp'>) => {
    if (!isLoaded) return;

    setHistory((prev) => {
      // Find existing entry for same movie
      const existing = prev.find((h) => h.slug === item.slug);

      // Remove existing entry
      const filtered = prev.filter((h) => h.slug !== item.slug);

      // If new item has 0 progress but we have existing progress, preserve it
      const progress = (item.progress === 0 && existing) ? existing.progress : item.progress;
      const duration = (item.duration === undefined && existing) ? existing.duration : item.duration;
      const episodeSlug = (item.episodeSlug === existing?.episodeSlug) ? item.episodeSlug : item.episodeSlug;

      // Add new entry at the beginning
      const newHistory = [
        { ...item, progress, duration, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_HISTORY_ITEMS);

      return newHistory;
    });
  }, [isLoaded]);

  const updateProgress = useCallback((slug: string, episodeSlug: string, progress: number, duration?: number) => {
    if (!isLoaded) return;

    setHistory((prev) => {
      return prev.map((item) => {
        if (item.slug === slug) {
          return {
            ...item,
            episodeSlug,
            progress,
            duration,
            timestamp: Date.now(),
          };
        }
        return item;
      });
    });
  }, [isLoaded]);

  const removeFromHistory = useCallback((slug: string) => {
    setHistory((prev) => prev.filter((h) => h.slug !== slug));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getResumeInfo = useCallback((slug: string) => {
    return history.find((h) => h.slug === slug);
  }, [history]);

  const getContinueWatching = useCallback(() => {
    return history
      .filter((h) => h.progress > 5 && h.progress < 95)
      .slice(0, 10);
  }, [history]);

  return {
    history,
    isLoaded,
    addToHistory,
    updateProgress,
    removeFromHistory,
    clearHistory,
    getResumeInfo,
    getContinueWatching,
  };
};
