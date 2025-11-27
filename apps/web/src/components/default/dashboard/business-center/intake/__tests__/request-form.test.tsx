/**
 * RequestFormClient Component Tests
 * Tests for the multi-step request form component
 *
 * Note: Tests that require Select component interactions are simplified
 * due to jsdom limitations with Radix UI Select (scrollIntoView, hasPointerCapture)
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RequestFormClient } from '../request-form-client';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the createRequest action
const mockCreateRequest = vi.fn();
vi.mock('@/lib/actions/business-center/requests', () => ({
  createRequest: (...args: unknown[]) => mockCreateRequest(...args) as unknown,
}));

// Mock intake store
const mockSaveDraft = vi.fn();
const mockClearDraft = vi.fn();
vi.mock('@/lib/stores/intake-store', () => ({
  useIntakeStore: () => ({
    draft: null,
    saveDraft: mockSaveDraft,
    clearDraft: mockClearDraft,
    draftStep: 0,
  }),
}));

describe('RequestFormClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the form header', () => {
      render(<RequestFormClient />);
      expect(screen.getByText('Submit New Request')).toBeInTheDocument();
    });

    it('should render back to intake button', () => {
      render(<RequestFormClient />);
      expect(screen.getByText('Back to Intake')).toBeInTheDocument();
    });

    it('should render step indicators', () => {
      render(<RequestFormClient />);
      // Should show all 4 step numbers
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      render(<RequestFormClient />);
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    });

    it('should show Basic Info step by default', () => {
      render(<RequestFormClient />);
      // 'Basic Info' appears in step indicators and card header
      // Check for unique description instead
      expect(screen.getByText('Title, type, and priority')).toBeInTheDocument();
    });

    it('should render form description', () => {
      render(<RequestFormClient />);
      expect(
        screen.getByText('Fill out the form to submit a new work request')
      ).toBeInTheDocument();
    });
  });

  describe('Step 1: Basic Info Fields', () => {
    it('should render title input', () => {
      render(<RequestFormClient />);
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    it('should render type select', () => {
      render(<RequestFormClient />);
      expect(screen.getByText('Request Type *')).toBeInTheDocument();
    });

    it('should render priority select', () => {
      render(<RequestFormClient />);
      expect(screen.getByText('Priority *')).toBeInTheDocument();
    });

    it('should render Next button', () => {
      render(<RequestFormClient />);
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should render disabled Back button on first step', () => {
      render(<RequestFormClient />);
      const backButton = screen.getByRole('button', { name: /^back$/i });
      expect(backButton).toBeDisabled();
    });

    it('should have title input placeholder', () => {
      render(<RequestFormClient />);
      expect(screen.getByPlaceholderText('Brief description of the request')).toBeInTheDocument();
    });
  });

  describe('Step Navigation - Without Select Interaction', () => {
    it('should allow typing in title field', async () => {
      const user = userEvent.setup();
      render(<RequestFormClient />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Request Title');

      expect(titleInput).toHaveValue('Test Request Title');
    });

    it('should navigate to next step when Next is clicked with valid data', async () => {
      const user = userEvent.setup();
      render(<RequestFormClient />);

      // Fill in required fields
      await user.type(screen.getByLabelText(/title/i), 'Test Request');

      // Click Next
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Should advance to step 2
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      });
    });

    it('should call saveDraft when navigating between steps', async () => {
      const user = userEvent.setup();
      render(<RequestFormClient />);

      // Fill in required fields
      await user.type(screen.getByLabelText(/title/i), 'Test Request');

      // Click Next
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Verify saveDraft was called
      await waitFor(() => {
        expect(mockSaveDraft).toHaveBeenCalled();
      });
    });

    it('should navigate back when Back button is clicked', async () => {
      const user = userEvent.setup();
      render(<RequestFormClient />);

      // Go to step 2 first
      await user.type(screen.getByLabelText(/title/i), 'Test Request');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      });

      // Go back
      await user.click(screen.getByRole('button', { name: /^back$/i }));

      await waitFor(() => {
        expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      });
    });
  });

  describe('Step 2: Details Fields', () => {
    const goToStep2 = async () => {
      const user = userEvent.setup();
      render(<RequestFormClient />);
      await user.type(screen.getByLabelText(/title/i), 'Test Request');
      await user.click(screen.getByRole('button', { name: /next/i }));
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      });
      return user;
    };

    it('should render description field', async () => {
      await goToStep2();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('should render business justification field', async () => {
      await goToStep2();
      expect(screen.getByText('Business Justification')).toBeInTheDocument();
    });

    it('should render description placeholder', async () => {
      await goToStep2();
      expect(
        screen.getByPlaceholderText('Detailed description of the request')
      ).toBeInTheDocument();
    });

    it('should render Details card description', async () => {
      await goToStep2();
      // 'Details' appears in step indicators, check unique description
      expect(screen.getByText('Description and justification')).toBeInTheDocument();
    });
  });

  describe('Step 3: Context Fields', () => {
    const goToStep3 = async () => {
      const user = userEvent.setup();
      render(<RequestFormClient />);

      // Step 1
      await user.type(screen.getByLabelText(/title/i), 'Test Request');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2
      await waitFor(() => expect(screen.getByText('Step 2 of 4')).toBeInTheDocument());
      await user.type(screen.getByLabelText(/description/i), 'Test description');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => expect(screen.getByText('Step 3 of 4')).toBeInTheDocument());
      return user;
    };

    it('should render dependencies field', async () => {
      await goToStep3();
      expect(screen.getByText('Dependencies')).toBeInTheDocument();
    });

    it('should render additional notes field', async () => {
      await goToStep3();
      expect(screen.getByText('Additional Notes')).toBeInTheDocument();
    });

    it('should render Context card description', async () => {
      await goToStep3();
      // 'Context' appears in step indicators, check unique description
      expect(screen.getByText('Related projects and dependencies')).toBeInTheDocument();
    });
  });

  describe('Step 4: Timeline Fields', () => {
    const goToStep4 = async () => {
      const user = userEvent.setup();
      render(<RequestFormClient />);

      // Step 1
      await user.type(screen.getByLabelText(/title/i), 'Test Request');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2
      await waitFor(() => expect(screen.getByText('Step 2 of 4')).toBeInTheDocument());
      await user.type(screen.getByLabelText(/description/i), 'Test description');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 3
      await waitFor(() => expect(screen.getByText('Step 3 of 4')).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 4
      await waitFor(() => expect(screen.getByText('Step 4 of 4')).toBeInTheDocument());
      return user;
    };

    it('should render delivery date field', async () => {
      await goToStep4();
      expect(screen.getByText('Desired Delivery Date')).toBeInTheDocument();
    });

    it('should render Submit button on final step', async () => {
      await goToStep4();
      expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
    });

    it('should render request summary', async () => {
      await goToStep4();
      expect(screen.getByText('Request Summary')).toBeInTheDocument();
    });

    it('should render Timeline card description', async () => {
      await goToStep4();
      // Timeline appears multiple times (step indicator + card title)
      // Check for card description instead
      expect(screen.getByText('Delivery expectations')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should not advance step without required title', async () => {
      const user = userEvent.setup();
      render(<RequestFormClient />);

      // Try to advance without filling title
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Should still be on step 1
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    });
  });

  describe('Back to Intake Navigation', () => {
    it('should navigate back to intake when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<RequestFormClient />);

      await user.click(screen.getByText('Back to Intake'));

      expect(mockPush).toHaveBeenCalledWith('/dashboard/business-center/intake');
    });
  });

  describe('Step Indicator Navigation', () => {
    it('should allow clicking on completed step indicators', async () => {
      const user = userEvent.setup();
      render(<RequestFormClient />);

      // Fill step 1 and go to step 2
      await user.type(screen.getByLabelText(/title/i), 'Test Request');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => expect(screen.getByText('Step 2 of 4')).toBeInTheDocument());

      // Click on step 1 indicator to go back
      const step1Indicator = screen.getByText('1');
      await user.click(step1Indicator);

      await waitFor(() => {
        expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have form element', () => {
      render(<RequestFormClient />);
      expect(document.querySelector('form')).toBeInTheDocument();
    });

    it('should have accessible step indicators', () => {
      render(<RequestFormClient />);

      const stepIndicators = screen.getAllByRole('button');
      // Should have step indicators + navigation buttons
      expect(stepIndicators.length).toBeGreaterThan(4);
    });

    it('should have accessible labels for form fields', () => {
      render(<RequestFormClient />);

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('should show correct progress for step 1', () => {
      render(<RequestFormClient />);
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    });

    it('should update progress when moving to step 2', async () => {
      const user = userEvent.setup();
      render(<RequestFormClient />);

      await user.type(screen.getByLabelText(/title/i), 'Test Request');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      });
    });
  });
});
