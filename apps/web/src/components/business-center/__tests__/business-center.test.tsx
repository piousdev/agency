/**
 * Business Center Component Tests
 * Tests for Business Center components and their integration
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BusinessCenter } from '../index';
import type { BusinessCenterData } from '../types';

// Mock empty data for testing
const mockEmptyData: BusinessCenterData = {
  intakeTickets: [],
  activeProjects: [],
  teamMembers: [],
  upcomingDeliveries: [],
  recentlyCompleted: [],
};

describe('BusinessCenter', () => {
  it('should render the main heading', () => {
    render(<BusinessCenter data={mockEmptyData} />);
    expect(screen.getByText('Business Center')).toBeInTheDocument();
  });

  it('should render all 6 section titles', () => {
    render(<BusinessCenter data={mockEmptyData} />);

    expect(screen.getByText('Intake Queue')).toBeInTheDocument();
    expect(screen.getByText('Active Work - Content')).toBeInTheDocument();
    expect(screen.getByText('Active Work - Software')).toBeInTheDocument();
    expect(screen.getByText('Team Capacity')).toBeInTheDocument();
    expect(screen.getByText('Delivery Calendar')).toBeInTheDocument();
    expect(screen.getByText('Recently Completed')).toBeInTheDocument();
  });

  it('should display empty states when no data', () => {
    render(<BusinessCenter data={mockEmptyData} />);

    expect(screen.getByText('No pending intake requests')).toBeInTheDocument();
    expect(screen.getByText('No active content projects')).toBeInTheDocument();
    expect(screen.getByText('No active software projects')).toBeInTheDocument();
    expect(screen.getByText('No team members')).toBeInTheDocument();
    expect(screen.getByText('No upcoming deliveries')).toBeInTheDocument();
    expect(screen.getByText('No recently completed projects')).toBeInTheDocument();
  });
});
