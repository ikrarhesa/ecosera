import { useState, useCallback, useEffect } from "react";

const RECENTLY_VIEWED_KEY = "ecosera_recently_viewed";
const MAX_RECENT = 10;

export function useRecentlyViewed() {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setRecentlyViewedIds(JSON.parse(stored));
      }
    } catch { }
  }, []);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewedIds((prev) => {
      // Remove the id if it already exists, to bring it to the front
      const filtered = prev.filter(item => item !== id);
      const updated = [id, ...filtered].slice(0, MAX_RECENT);
      
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      } catch { }
      
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewedIds([]);
    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch { }
  }, []);

  return {
    recentlyViewedIds,
    addRecentlyViewed,
    clearRecentlyViewed,
  };
}
