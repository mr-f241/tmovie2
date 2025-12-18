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
    setHistory((prev) => {
      // Remove existing entry for same movie
      const filtered = prev.filter((h) => h.slug !== item.slug);
      
      // Add new entry at the beginning
      const newHistory = [
        { ...item, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_HISTORY_ITEMS);
      
      return newHistory;
    });
  }, []);

  const updateProgress = useCallback((slug: string, episodeSlug: string, progress: number, duration?: number) => {
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
  }, []);

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
