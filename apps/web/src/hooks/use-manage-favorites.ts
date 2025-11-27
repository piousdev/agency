'use client';

import { useCallback, useEffect, useState } from 'react';

export interface FavoriteItem {
  id: string;
  type: 'page' | 'project' | 'client' | 'issue';
  title: string;
  url: string;
  timestamp: number;
}

const STORAGE_KEY = 'skyll-favorites';
const MAX_FAVORITES = 50;

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FavoriteItem[];
        setFavorites(parsed);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = useCallback((newFavorites: FavoriteItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, []);

  // Add item to favorites
  const addFavorite = useCallback(
    (item: Omit<FavoriteItem, 'timestamp'>) => {
      const newItem: FavoriteItem = {
        ...item,
        timestamp: Date.now(),
      };

      const updated = [newItem, ...favorites.filter((f) => f.id !== item.id)].slice(
        0,
        MAX_FAVORITES
      );
      saveFavorites(updated);
    },
    [favorites, saveFavorites]
  );

  // Remove item from favorites
  const removeFavorite = useCallback(
    (id: string) => {
      const updated = favorites.filter((f) => f.id !== id);
      saveFavorites(updated);
    },
    [favorites, saveFavorites]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    (item: Omit<FavoriteItem, 'timestamp'>) => {
      const isFavorited = favorites.some((f) => f.id === item.id);
      if (isFavorited) {
        removeFavorite(item.id);
      } else {
        addFavorite(item);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  // Check if item is favorited
  const isFavorited = useCallback(
    (id: string) => {
      return favorites.some((f) => f.id === id);
    },
    [favorites]
  );

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    saveFavorites([]);
  }, [saveFavorites]);

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
    clearFavorites,
  };
}
