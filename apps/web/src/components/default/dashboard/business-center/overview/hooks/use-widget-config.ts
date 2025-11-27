'use client';

import { useState, useCallback } from 'react';

export function useWidgetConfig() {
  const [isOpen, setIsOpen] = useState(false);
  const [widget, setWidget] = useState<{ id: string; type: string } | null>(null);

  const openConfig = useCallback((id: string, type: string) => {
    setWidget({ id, type });
    setIsOpen(true);
  }, []);

  const closeConfig = useCallback(() => setIsOpen(false), []);

  return { isOpen, widget, openConfig, closeConfig, setIsOpen };
}
