/**
 * EstimationForm Component Tests
 * Tests for the estimation form component
 *
 * Note: Tests that require Select component interactions are skipped
 * due to jsdom limitations with Radix UI Select (scrollIntoView, hasPointerCapture)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EstimationForm } from '../estimation-form';
import type { RequestWithRelations } from '@/lib/api/requests/types';

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

// Mock the estimateRequest action
const mockEstimateRequest = vi.fn();
vi.mock('@/lib/actions/business-center/requests', () => ({
  estimateRequest: (...args: unknown[]) => mockEstimateRequest(...args),
}));

// Test data
const mockRequest: RequestWithRelations = {
  id: 'req-123',
  requestNumber: 'REQ-001',
  title: 'Test Feature Request',
  description: 'Test description',
  type: 'feature',
  stage: 'estimation',
  priority: 'high',
  createdAt: new Date('2024-01-15').toISOString(),
  updatedAt: new Date('2024-01-15').toISOString(),
  stageEnteredAt: new Date().toISOString(),
  requesterId: 'user-1',
  storyPoints: null,
  confidence: null,
  estimationNotes: null,
  clientId: null,
  client: null,
  assignedPmId: null,
  assignedPm: null,
  tags: [],
  businessJustification: null,
  dependencies: null,
  additionalNotes: null,
  stepsToReproduce: null,
  desiredDeliveryDate: null,
  convertedToProjectId: null,
  convertedToTicketId: null,
  relatedProjectId: null,
  estimatorId: null,
  holdReason: null,
  requester: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
  },
};

const mockRequestWithExistingEstimation: RequestWithRelations = {
  ...mockRequest,
  storyPoints: 5,
  confidence: 'medium',
  estimationNotes: 'Existing notes',
};

describe('EstimationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the form heading', () => {
      render(<EstimationForm request={mockRequest} />);
      // 'Submit Estimation' appears in both h1 and submit button
      expect(screen.getByRole('heading', { name: /submit estimation/i })).toBeInTheDocument();
    });

    it('should render the request title in description', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByText(/Test Feature Request/)).toBeInTheDocument();
    });

    it('should render back to request button', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByText('Back to Request')).toBeInTheDocument();
    });

    it('should render estimation details card', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByText('Estimation Details')).toBeInTheDocument();
    });

    it('should render description about stage transition', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByText(/moved to Ready stage/)).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should render story points selector', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByText('Story Points *')).toBeInTheDocument();
    });

    it('should render confidence level selector', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByText('Confidence Level *')).toBeInTheDocument();
    });

    it('should render estimation notes field', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByRole('button', { name: /submit estimation/i })).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should render notes textarea placeholder', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByPlaceholderText(/assumptions or notes/i)).toBeInTheDocument();
    });
  });

  describe('Default Values', () => {
    it('should show medium confidence as default', () => {
      render(<EstimationForm request={mockRequest} />);
      // The confidence combobox should have medium as default
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes[1]).toHaveTextContent(/medium/i);
    });

    it('should pre-fill existing estimation notes', () => {
      render(<EstimationForm request={mockRequestWithExistingEstimation} />);

      // Check that the existing notes are pre-filled
      const notesInput = screen.getByPlaceholderText(/assumptions or notes/i);
      expect(notesInput).toHaveValue('Existing notes');
    });

    it('should show story points placeholder when none selected', () => {
      render(<EstimationForm request={mockRequest} />);
      // First combobox is story points, should show placeholder
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes[0]).toHaveTextContent(/select story points/i);
    });
  });

  describe('Form Description Text', () => {
    it('should show description about Fibonacci sequence', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByText(/Fibonacci sequence/)).toBeInTheDocument();
    });

    it('should show description about confidence level', () => {
      render(<EstimationForm request={mockRequest} />);
      expect(screen.getByText(/How confident are you/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<EstimationForm request={mockRequest} />);

      await user.click(screen.getByText('Back to Request'));

      expect(mockPush).toHaveBeenCalledWith('/dashboard/business-center/intake/req-123');
    });

    it('should navigate back when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<EstimationForm request={mockRequest} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockPush).toHaveBeenCalledWith('/dashboard/business-center/intake/req-123');
    });
  });

  describe('Notes Input', () => {
    it('should allow typing in notes field', async () => {
      const user = userEvent.setup();
      render(<EstimationForm request={mockRequest} />);

      const notesInput = screen.getByPlaceholderText(/assumptions or notes/i);
      await user.type(notesInput, 'Test estimation notes');

      expect(notesInput).toHaveValue('Test estimation notes');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      render(<EstimationForm request={mockRequest} />);

      // Form should have all required labels
      expect(screen.getByText('Story Points *')).toBeInTheDocument();
      expect(screen.getByText('Confidence Level *')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<EstimationForm request={mockRequest} />);

      expect(screen.getByRole('button', { name: /submit estimation/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to request/i })).toBeInTheDocument();
    });
  });

  describe('Form Structure', () => {
    it('should render form element', () => {
      render(<EstimationForm request={mockRequest} />);
      // HTML form element exists
      expect(document.querySelector('form')).toBeInTheDocument();
    });

    it('should have two comboboxes for selects', () => {
      render(<EstimationForm request={mockRequest} />);
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes).toHaveLength(2);
    });
  });
});
