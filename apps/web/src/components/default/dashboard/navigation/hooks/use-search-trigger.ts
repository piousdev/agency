import { useCallback } from 'react';

/**
 * Custom hook that handles command palette trigger logic.
 * Separates the search trigger behavior from UI components.
 *
 * @returns Object containing the search click handler
 */
export function useSearchTrigger() {
  const triggerSearch = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    document.dispatchEvent(event);
  }, []);

  return { triggerSearch };
}
