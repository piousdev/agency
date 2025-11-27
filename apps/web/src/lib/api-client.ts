import { headers } from 'next/headers';

/**
 * Server-side fetch wrapper that automatically attaches cookies
 * and handles base URL configuration.
 */
export async function serverFetch(path: string, options: RequestInit = {}): Promise<Response> {
  let headersList;
  try {
    headersList = await headers();
  } catch (_e) {
    // Ignore error, likely during prerendering
  }
  const cookie = headersList?.get('cookie');

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${String(process.env.NEXT_PUBLIC_API_URL)}${normalizedPath}`;

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : Array.isArray(options.headers)
          ? Object.fromEntries(options.headers)
          : options.headers),
      ...(cookie ? { cookie } : {}),
    },
    cache: options.cache ?? 'no-store',
  });
}
