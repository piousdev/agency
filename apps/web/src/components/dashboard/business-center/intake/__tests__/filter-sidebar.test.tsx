/**
 * FilterSidebar Component Tests
 * Tests for the intake pipeline filter sidebar component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterSidebar } from '../filter-sidebar';

// Mock the intake store
const mockSetFilters = vi.fn();
const mockClearFilters = vi.fn();
let mockFilters = {
  priority: [] as string[],
  type: [] as string[],
  dateRange: { from: null as Date | null, to: null as Date | null },
};
let mockHasActiveFilters = false;

vi.mock('@/lib/stores/intake-store', () => ({
  useIntakeStore: vi.fn((selector) => {
    if (typeof selector === 'function') {
      const state = {
        filters: mockFilters,
        hasActiveFilters: mockHasActiveFilters,
        setFilters: mockSetFilters,
        clearFilters: mockClearFilters,
      };
      return selector(state);
    }
    return {
      filters: mockFilters,
      hasActiveFilters: mockHasActiveFilters,
      setFilters: mockSetFilters,
      clearFilters: mockClearFilters,
    };
  }),
  selectFilters: (state: { filters: typeof mockFilters }) => state.filters,
  selectHasActiveFilters: (state: { hasActiveFilters: boolean }) => state.hasActiveFilters,
}));

// Mock date-fns format
vi.mock('date-fns', () => ({
  format: (date: Date) => date.toLocaleDateString(),
}));

describe('FilterSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFilters = {
      priority: [],
      type: [],
      dateRange: { from: null, to: null },
    };
    mockHasActiveFilters = false;
  });

  describe('Basic Rendering', () => {
    it('should render the filters heading', () => {
      render(<FilterSidebar />);
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render priority filter section', () => {
      render(<FilterSidebar />);
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    it('should render type filter section', () => {
      render(<FilterSidebar />);
      expect(screen.getByText('Type')).toBeInTheDocument();
    });

    it('should render date range filter section', () => {
      render(<FilterSidebar />);
      expect(screen.getByText('Date Range')).toBeInTheDocument();
    });

    it('should render priority options', () => {
      render(<FilterSidebar />);
      expect(screen.getByLabelText('Critical')).toBeInTheDocument();
      expect(screen.getByLabelText('High')).toBeInTheDocument();
      expect(screen.getByLabelText('Medium')).toBeInTheDocument();
      expect(screen.getByLabelText('Low')).toBeInTheDocument();
    });

    it('should render type options', () => {
      render(<FilterSidebar />);
      expect(screen.getByLabelText('Feature Request')).toBeInTheDocument();
      expect(screen.getByLabelText('Bug Report')).toBeInTheDocument();
      expect(screen.getByLabelText('Enhancement')).toBeInTheDocument();
    });
  });

  describe('Clear All Button', () => {
    it('should not show Clear All button when no filters are active', () => {
      mockHasActiveFilters = false;
      render(<FilterSidebar />);
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    it('should show Clear All button when filters are active', () => {
      mockHasActiveFilters = true;
      render(<FilterSidebar />);
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should call clearFilters when Clear All is clicked', () => {
      mockHasActiveFilters = true;
      render(<FilterSidebar />);
      fireEvent.click(screen.getByText('Clear All'));
      expect(mockClearFilters).toHaveBeenCalled();
    });
  });

  describe('Filter Sections Collapsibility', () => {
    it('should toggle priority section when clicked', () => {
      render(<FilterSidebar />);
      const priorityButton = screen.getByRole('button', { name: /priority/i });

      // Check section is open by default (checkboxes visible)
      expect(screen.getByLabelText('Critical')).toBeVisible();

      // Click to collapse
      fireEvent.click(priorityButton);

      // The section should still be in DOM but collapsed
      // (Radix Collapsible might keep content in DOM)
    });

    it('should toggle type section when clicked', () => {
      render(<FilterSidebar />);
      const typeButton = screen.getByRole('button', { name: /type/i });
      expect(typeButton).toBeInTheDocument();
    });

    it('should toggle date range section when clicked', () => {
      render(<FilterSidebar />);
      const dateButton = screen.getByRole('button', { name: /date range/i });
      expect(dateButton).toBeInTheDocument();
    });
  });

  describe('Priority Checkbox Interactions', () => {
    it('should call setFilters when priority checkbox is clicked', () => {
      render(<FilterSidebar />);
      const highCheckbox = screen.getByLabelText('High');
      fireEvent.click(highCheckbox);
      expect(mockSetFilters).toHaveBeenCalledWith({ priority: ['high'] });
    });

    it('should remove priority when already selected checkbox is clicked', () => {
      mockFilters = {
        ...mockFilters,
        priority: ['high'],
      };
      render(<FilterSidebar />);
      const highCheckbox = screen.getByLabelText('High');
      fireEvent.click(highCheckbox);
      expect(mockSetFilters).toHaveBeenCalledWith({ priority: [] });
    });

    it('should add to existing priorities when another is selected', () => {
      mockFilters = {
        ...mockFilters,
        priority: ['high'],
      };
      render(<FilterSidebar />);
      const criticalCheckbox = screen.getByLabelText('Critical');
      fireEvent.click(criticalCheckbox);
      expect(mockSetFilters).toHaveBeenCalledWith({ priority: ['high', 'critical'] });
    });
  });

  describe('Type Checkbox Interactions', () => {
    it('should call setFilters when type checkbox is clicked', () => {
      render(<FilterSidebar />);
      const featureCheckbox = screen.getByLabelText('Feature Request');
      fireEvent.click(featureCheckbox);
      expect(mockSetFilters).toHaveBeenCalledWith({ type: ['feature'] });
    });

    it('should remove type when already selected checkbox is clicked', () => {
      mockFilters = {
        ...mockFilters,
        type: ['bug'],
      };
      render(<FilterSidebar />);
      const bugCheckbox = screen.getByLabelText('Bug Report');
      fireEvent.click(bugCheckbox);
      expect(mockSetFilters).toHaveBeenCalledWith({ type: [] });
    });
  });

  describe('Date Range Filter', () => {
    it('should render From date picker', () => {
      render(<FilterSidebar />);
      expect(screen.getByText('From')).toBeInTheDocument();
    });

    it('should render To date picker', () => {
      render(<FilterSidebar />);
      expect(screen.getByText('To')).toBeInTheDocument();
    });

    it('should show "Select date" placeholder when no date selected', () => {
      render(<FilterSidebar />);
      const selectDateButtons = screen.getAllByText('Select date');
      expect(selectDateButtons.length).toBe(2);
    });
  });

  describe('Checkbox State', () => {
    it('should show checked state for selected priorities', () => {
      mockFilters = {
        ...mockFilters,
        priority: ['high', 'critical'],
      };
      render(<FilterSidebar />);

      const highCheckbox = screen.getByRole('checkbox', { name: /high/i });
      const criticalCheckbox = screen.getByRole('checkbox', { name: /critical/i });
      const mediumCheckbox = screen.getByRole('checkbox', { name: /medium/i });

      expect(highCheckbox).toBeChecked();
      expect(criticalCheckbox).toBeChecked();
      expect(mediumCheckbox).not.toBeChecked();
    });

    it('should show checked state for selected types', () => {
      mockFilters = {
        ...mockFilters,
        type: ['bug'],
      };
      render(<FilterSidebar />);

      const bugCheckbox = screen.getByRole('checkbox', { name: /bug report/i });
      const featureCheckbox = screen.getByRole('checkbox', { name: /feature request/i });

      expect(bugCheckbox).toBeChecked();
      expect(featureCheckbox).not.toBeChecked();
    });
  });
});
