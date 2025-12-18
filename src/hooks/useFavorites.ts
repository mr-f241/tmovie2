import { useState, useEffect, useCallback } from 'react';
import { secureStorage } from '@/lib/crypto';

export interface FavoriteItem {
  slug: string;
  name: string;
  posterUrl: string;
  originName: string;
  year: number;
  timestamp: number;
}

const FAVORITES_KEY = 'favorites';
const MAX_FAVORITES = 100;

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = secureStorage.get<FavoriteItem[]>(FAVORITES_KEY, []);
    setFavorites(stored);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      secureStorage.set(FAVORITES_KEY, favorites);
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((item: Omit<FavoriteItem, 'timestamp'>) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.slug === item.slug)) {
        return prev;
      }
      return [{ ...item, timestamp: Date.now() }, ...prev].slice(0, MAX_FAVORITES);
    });
  }, []);

  const removeFavorite = useCallback((slug: string) => {
    setFavorites((prev) => prev.filter((f) => f.slug !== slug));
  }, []);

  const isFavorite = useCallback((slug: string) => {
    return favorites.some((f) => f.slug === slug);
  }, [favorites]);

  const toggleFavorite = useCallback((item: Omit<FavoriteItem, 'timestamp'>) => {
    if (isFavorite(item.slug)) {
      removeFavorite(item.slug);
      return false;
    } else {
      addFavorite(item);
      return true;
    }
  }, [isFavorite, removeFavorite, addFavorite]);

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
};
