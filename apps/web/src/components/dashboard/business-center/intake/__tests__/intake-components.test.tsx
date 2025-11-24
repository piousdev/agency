/**
 * Intake Pipeline Component Tests
 * Tests for RequestCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RequestCard } from '../request-card';
import type { Request } from '@/lib/api/requests/types';
import type { RequestStage } from '@/lib/schemas/request';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock zustand store
vi.mock('@/lib/stores/intake-store', () => ({
  useIntakeStore: vi.fn(() => ({
    toggleSelection: vi.fn(),
    isSelected: vi.fn(() => false),
  })),
}));

// Test data
const mockRequest: Request = {
  id: 'req-123',
  requestNumber: 'REQ-001',
  title: 'Test Feature Request',
  description: 'This is a test description for the feature request',
  type: 'feature',
  stage: 'in_treatment',
  priority: 'high',
  createdAt: new Date('2024-01-15').toISOString(),
  updatedAt: new Date('2024-01-15').toISOString(),
  stageEnteredAt: new Date().toISOString(),
  requesterId: 'user-1',
  storyPoints: null,
  confidence: null,
  clientId: null,
  client: null,
  assignedPmId: null,
  assignedPm: null,
  tags: ['frontend', 'urgent'],
};

const mockRequestWithPm: Request = {
  ...mockRequest,
  assignedPmId: 'pm-1',
  assignedPm: {
    id: 'pm-1',
    name: 'John Doe',
    email: 'john@example.com',
    image: null,
  },
};

const mockRequestWithEstimation: Request = {
  ...mockRequest,
  stage: 'ready',
  storyPoints: 8,
  confidence: 'high',
};

describe('RequestCard', () => {
  describe('Basic Rendering', () => {
    it('should render request number', () => {
      render(<RequestCard request={mockRequest} />);
      expect(screen.getByText('REQ-001')).toBeInTheDocument();
    });

    it('should render request title', () => {
      render(<RequestCard request={mockRequest} />);
      expect(screen.getByText('Test Feature Request')).toBeInTheDocument();
    });

    it('should render priority badge', () => {
      render(<RequestCard request={mockRequest} />);
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should render request type badge', () => {
      render(<RequestCard request={mockRequest} />);
      expect(screen.getByText('Feature Request')).toBeInTheDocument();
    });

    it('should render stage badge', () => {
      render(<RequestCard request={mockRequest} />);
      expect(screen.getByText('In Treatment')).toBeInTheDocument();
    });

    it('should render description when present', () => {
      render(<RequestCard request={mockRequest} />);
      expect(
        screen.getByText('This is a test description for the feature request')
      ).toBeInTheDocument();
    });
  });

  describe('Tags', () => {
    it('should render tags', () => {
      render(<RequestCard request={mockRequest} />);
      expect(screen.getByText('frontend')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
    });

    it('should show "+N" when more than 3 tags', () => {
      const requestWithManyTags: Request = {
        ...mockRequest,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      };
      render(<RequestCard request={requestWithManyTags} />);
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should handle empty tags array', () => {
      const requestNoTags: Request = {
        ...mockRequest,
        tags: [],
      };
      render(<RequestCard request={requestNoTags} />);
      // Should not crash and still render other elements
      expect(screen.getByText('Test Feature Request')).toBeInTheDocument();
    });
  });

  describe('Assigned PM', () => {
    it('should show "Unassigned" when no PM assigned', () => {
      render(<RequestCard request={mockRequest} />);
      expect(screen.getByText('Unassigned')).toBeInTheDocument();
    });

    it('should show PM name when assigned', () => {
      render(<RequestCard request={mockRequestWithPm} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should show PM avatar with initials', () => {
      render(<RequestCard request={mockRequestWithPm} />);
      // Avatar fallback should show "JD"
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Estimation Info', () => {
    it('should show story points when available', () => {
      render(<RequestCard request={mockRequestWithEstimation} />);
      expect(screen.getByText('8 SP')).toBeInTheDocument();
    });

    it('should show confidence level when available', () => {
      render(<RequestCard request={mockRequestWithEstimation} />);
      expect(screen.getByText('high confidence')).toBeInTheDocument();
    });

    it('should not show estimation info when not estimated', () => {
      render(<RequestCard request={mockRequest} />);
      expect(screen.queryByText(/SP$/)).not.toBeInTheDocument();
    });
  });

  describe('Priority Variants', () => {
    it.each([
      ['critical', 'Critical'],
      ['high', 'High'],
      ['medium', 'Medium'],
      ['low', 'Low'],
    ])('should render %s priority correctly', (priority, label) => {
      const request: Request = { ...mockRequest, priority: priority as Request['priority'] };
      render(<RequestCard request={request} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  describe('Stage Variants', () => {
    it.each([
      ['in_treatment', 'In Treatment'],
      ['on_hold', 'On Hold'],
      ['estimation', 'Estimation'],
      ['ready', 'Ready'],
    ])('should render %s stage correctly', (stage, label) => {
      const request: Request = { ...mockRequest, stage: stage as RequestStage };
      render(<RequestCard request={request} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should show checkbox when selectable', () => {
      render(<RequestCard request={mockRequest} selectable />);
      expect(screen.getByTestId('request-checkbox')).toBeInTheDocument();
    });

    it('should not show checkbox when not selectable', () => {
      render(<RequestCard request={mockRequest} selectable={false} />);
      expect(screen.queryByTestId('request-checkbox')).not.toBeInTheDocument();
    });
  });

  describe('Actions Menu', () => {
    it('should render actions button', () => {
      render(<RequestCard request={mockRequest} />);
      expect(screen.getByRole('button', { name: /actions/i })).toBeInTheDocument();
    });

    it('should have link to detail page', () => {
      render(<RequestCard request={mockRequest} />);
      const link = screen.getByRole('link', { name: /test feature request/i });
      expect(link).toHaveAttribute('href', '/dashboard/business-center/intake/req-123');
    });
  });

  describe('Client Info', () => {
    it('should show client name when available', () => {
      const requestWithClient: Request = {
        ...mockRequest,
        clientId: 'client-1',
        client: {
          id: 'client-1',
          name: 'Acme Corp',
          email: 'acme@example.com',
        },
      };
      render(<RequestCard request={requestWithClient} />);
      expect(screen.getByText('Client: Acme Corp')).toBeInTheDocument();
    });

    it('should not show client info when not available', () => {
      render(<RequestCard request={mockRequest} />);
      expect(screen.queryByText(/^Client:/)).not.toBeInTheDocument();
    });
  });
});

describe('RequestCard Aging Indicators', () => {
  const createRequestWithAge = (hoursAgo: number, stage: RequestStage): Request => ({
    ...mockRequest,
    stage,
    stageEnteredAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
  });

  it('should render recent requests without error', () => {
    // Request entered stage 1 hour ago (well under 24h warning threshold for in_treatment)
    const recentRequest = createRequestWithAge(1, 'in_treatment');
    render(<RequestCard request={recentRequest} />);

    // Stage badge should render correctly
    expect(screen.getByText('In Treatment')).toBeInTheDocument();
  });

  it('should render requests approaching warning threshold', () => {
    // Request in in_treatment for 30 hours (past 24h warning threshold)
    const warningRequest = createRequestWithAge(30, 'in_treatment');
    render(<RequestCard request={warningRequest} />);

    // Should show stage and render without error
    expect(screen.getByText('In Treatment')).toBeInTheDocument();
  });

  it('should render requests past critical threshold', () => {
    // Request in in_treatment for 50 hours (past 48h critical threshold)
    const criticalRequest = createRequestWithAge(50, 'in_treatment');
    render(<RequestCard request={criticalRequest} />);

    // Should render correctly
    expect(screen.getByText('In Treatment')).toBeInTheDocument();
  });
});

describe('Request Type Variants', () => {
  it.each([
    ['bug', 'Bug Report'],
    ['feature', 'Feature Request'],
    ['enhancement', 'Enhancement'],
    ['change_request', 'Change Request'],
    ['support', 'Support Request'],
    ['other', 'Other'],
  ])('should render %s type as %s', (type, expectedLabel) => {
    const request: Request = { ...mockRequest, type: type as Request['type'] };
    render(<RequestCard request={request} />);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});
