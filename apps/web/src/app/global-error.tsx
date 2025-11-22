'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { RefreshCw, Home } from 'lucide-react';

/**
 * Root-level error boundary
 * Catches errors in the root layout - must include own <html> and <body>
 * Uses inline styles for critical fallback (no CSS dependencies)
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
          backgroundColor: '#0a0a0a',
          color: '#fafafa',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <main
          style={{
            width: '100%',
            maxWidth: '32rem',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          {/* Large Error Code */}
          <h1
            style={{
              fontSize: 'clamp(6rem, 20vw, 10rem)',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.05em',
              color: 'rgba(239, 68, 68, 0.2)',
              margin: 0,
              userSelect: 'none',
            }}
          >
            500
          </h1>

          {/* Title */}
          <h2
            style={{
              marginTop: '0.5rem',
              fontSize: 'clamp(1.5rem, 5vw, 1.875rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#fafafa',
            }}
          >
            Critical Error
          </h2>

          {/* Description */}
          <p
            style={{
              marginTop: '1rem',
              fontSize: '1rem',
              lineHeight: 1.625,
              color: 'rgba(250, 250, 250, 0.6)',
            }}
          >
            A critical error occurred in the application. Our team has been notified.
          </p>

          {/* Technical Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <details
              style={{
                marginTop: '1.5rem',
                textAlign: 'left',
                borderRadius: '0.5rem',
                border: '1px solid rgba(250, 250, 250, 0.1)',
                backgroundColor: 'rgba(250, 250, 250, 0.05)',
                padding: '1rem',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'rgba(250, 250, 250, 0.6)',
                }}
              >
                Technical details
              </summary>
              <pre
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '0.75rem',
                  color: 'rgba(250, 250, 250, 0.5)',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {error.message}
                {error.digest && `\n\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <button
              onClick={reset}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                borderRadius: '0.375rem',
                border: 'none',
                backgroundColor: '#fafafa',
                color: '#0a0a0a',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <RefreshCw size={16} />
              Try again
            </button>
            <a
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                borderRadius: '0.375rem',
                border: '1px solid rgba(250, 250, 250, 0.2)',
                backgroundColor: 'transparent',
                color: '#fafafa',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(250, 250, 250, 0.1)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Home size={16} />
              Go to Dashboard
            </a>
          </div>

          {/* Error Reference */}
          {error.digest && (
            <p
              style={{
                marginTop: '2rem',
                fontSize: '0.75rem',
                fontFamily: 'ui-monospace, monospace',
                color: 'rgba(250, 250, 250, 0.4)',
              }}
            >
              Error reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
