import { useState, useEffect, useCallback } from 'react';
import { secureStorage } from '@/lib/crypto';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_SEARCH_ITEMS = 10;

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history on mount
  useEffect(() => {
    const stored = secureStorage.get<string[]>(SEARCH_HISTORY_KEY, []);
    setSearchHistory(stored);
    setIsLoaded(true);
  }, []);

  // Save to storage when history changes
  useEffect(() => {
    if (isLoaded) {
      secureStorage.set(SEARCH_HISTORY_KEY, searchHistory);
    }
  }, [searchHistory, isLoaded]);

  const addToSearchHistory = useCallback((keyword: string) => {
    const cleanKeyword = keyword.trim();
    if (!cleanKeyword) return;

    setSearchHistory((prev) => {
      // Remove existing entry
      const filtered = prev.filter((k) => k.toLowerCase() !== cleanKeyword.toLowerCase());
      
      // Add new entry at the beginning
      const newHistory = [cleanKeyword, ...filtered].slice(0, MAX_SEARCH_ITEMS);
      
      return newHistory;
    });
  }, []);

  const removeFromSearchHistory = useCallback((keyword: string) => {
    setSearchHistory((prev) => prev.filter((k) => k !== keyword));
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    searchHistory,
    isLoaded,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
  };
};
