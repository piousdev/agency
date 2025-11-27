import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import BusinessCenterError from '../error';

vi.mock('@/components/ui/error-display', () => ({
  ErrorDisplay: ({ title, message, onRetry, showGoBack, showReturnHome }: any) => (
    <div data-testid="error-display">
      <h1>{title}</h1>
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
      {showGoBack && <button>Go Back</button>}
      {showReturnHome && <button>Return Home</button>}
    </div>
  ),
}));

describe('BusinessCenterError', () => {
  const mockReset = vi.fn();
  const mockError = new Error('Test error message');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {
      /* empty */
    });
  });

  it('renders error display with correct title and message', () => {
    render(<BusinessCenterError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Business Center Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders default message when error has no message', () => {
    const emptyError = new Error('');
    render(<BusinessCenterError error={emptyError} reset={mockReset} />);

    expect(
      screen.getByText('An unexpected error occurred in the Business Center.')
    ).toBeInTheDocument();
  });

  it('calls reset function when retry is clicked', () => {
    render(<BusinessCenterError error={mockError} reset={mockReset} />);

    screen.getByText('Retry').click();
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('shows go back button by default', () => {
    render(<BusinessCenterError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Go Back')).toBeInTheDocument();
  });

  it('hides go back button when showGoBack is false', () => {
    render(<BusinessCenterError error={mockError} reset={mockReset} showGoBack={false} />);

    expect(screen.queryByText('Go Back')).not.toBeInTheDocument();
  });

  it('shows return home button by default', () => {
    render(<BusinessCenterError error={mockError} reset={mockReset} />);

    expect(screen.getByText('Return Home')).toBeInTheDocument();
  });

  it('hides return home button when showReturnHome is false', () => {
    render(<BusinessCenterError error={mockError} reset={mockReset} showReturnHome={false} />);

    expect(screen.queryByText('Return Home')).not.toBeInTheDocument();
  });

  it('logs error to console in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development');

    render(<BusinessCenterError error={mockError} reset={mockReset} />);

    expect(console.error).toHaveBeenCalledWith('Business Center Error:', mockError);

    vi.unstubAllEnvs();
  });

  it('handles error with digest property', () => {
    const errorWithDigest = Object.assign(new Error('Error with digest'), { digest: 'abc123' });

    render(<BusinessCenterError error={errorWithDigest} reset={mockReset} />);

    expect(screen.getByText('Error with digest')).toBeInTheDocument();
  });
});
