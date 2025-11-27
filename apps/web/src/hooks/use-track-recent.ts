'use client';

import { useCallback, useEffect, useState } from 'react';

export interface RecentItem {
  id: string;
  type: 'page' | 'project' | 'client' | 'issue';
  title: string;
  url: string;
  timestamp: number;
}

const STORAGE_KEY = 'skyll-recent-items';
const MAX_RECENT_ITEMS = 20;

export function useRecentItems() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recent items from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentItem[];
        setRecentItems(parsed);
      }
    } catch (error) {
      console.error('Failed to load recent items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save recent items to localStorage
  const saveRecentItems = useCallback((items: RecentItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setRecentItems(items);
    } catch (error) {
      console.error('Failed to save recent items:', error);
    }
  }, []);

  // Add item to recent items
  const addRecentItem = useCallback(
    (item: Omit<RecentItem, 'timestamp'>) => {
      const newItem: RecentItem = {
        ...item,
        timestamp: Date.now(),
      };

      // Remove if already exists and add to front
      const updated = [newItem, ...recentItems.filter((r) => r.id !== item.id)].slice(
        0,
        MAX_RECENT_ITEMS
      );
      saveRecentItems(updated);
    },
    [recentItems, saveRecentItems]
  );

  // Remove item from recent items
  const removeRecentItem = useCallback(
    (id: string) => {
      const updated = recentItems.filter((r) => r.id !== id);
      saveRecentItems(updated);
    },
    [recentItems, saveRecentItems]
  );

  // Clear all recent items
  const clearRecentItems = useCallback(() => {
    saveRecentItems([]);
  }, [saveRecentItems]);

  return {
    recentItems,
    isLoading,
    addRecentItem,
    removeRecentItem,
    clearRecentItems,
  };
}
