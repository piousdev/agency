import type { MetadataRoute } from 'next';

/**
 * Web App Manifest for Skyll Internal Platform
 * Enables PWA features and better mobile experience
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Skyll - Creative Agency',
    short_name: 'Skyll',
    description:
      'We build what you imagine. Web development, software development, and creative services.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
