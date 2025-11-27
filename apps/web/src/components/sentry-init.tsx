'use client';

import { useEffect } from 'react';

/**
 * Sentry Client Initialization
 *
 * This component ensures Sentry is initialized on the client-side only.
 * We use useEffect to ensure the config is only loaded in the browser.
 */
export function SentryInit() {
  useEffect(() => {
    // Dynamically import Sentry client config only in the browser
    void import('../../sentry.client.config');
  }, []);

  return null;
}
