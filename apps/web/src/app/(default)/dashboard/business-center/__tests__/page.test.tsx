import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getOverviewData } from '@/lib/actions/business-center/overview';
import { requireInternalUser } from '@/lib/auth/session';

import OverviewDashboardPage from '../page';

import type { OverviewData } from '@/lib/actions/business-center/overview';
import type { SessionUser } from '@/lib/auth/session';

vi.mock('@/lib/auth/session');
vi.mock('@/lib/actions/business-center/overview');
vi.mock('@/components/default/dashboard/business-center/overview', () => ({
  OverviewDashboard: ({ userId, userName, userRole, initialData, ...props }: any) => (
    <div data-testid={props['data-testid']}>
      <div data-testid="user-id">{userId}</div>
      <div data-testid="user-name">{userName}</div>
      <div data-testid="user-role">{userRole}</div>
      <div data-testid="overview-data">{JSON.stringify(initialData)}</div>
    </div>
  ),
}));

describe('OverviewDashboardPage', () => {
  const mockUser: SessionUser = {
    id: 'user-123',
    name: 'John Doe',
    role: 'admin',
  } as SessionUser;
  const mockOverviewData: OverviewData = {} as OverviewData;
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireInternalUser).mockResolvedValue(mockUser);
    vi.mocked(getOverviewData).mockResolvedValue(mockOverviewData);
  });

  it('should render the OverviewDashboard component', async () => {
    const component = await OverviewDashboardPage();
    render(component);

    expect(screen.getByTestId('overview-dashboard-page')).toBeInTheDocument();
  });

  it('should fetch and pass user data to OverviewDashboard', async () => {
    const component = await OverviewDashboardPage();
    render(component);

    expect(requireInternalUser).toHaveBeenCalledOnce();
    expect(screen.getByTestId('user-id')).toHaveTextContent('user-123');
    expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
  });

  it('should fetch and pass overview data to OverviewDashboard', async () => {
    const component = await OverviewDashboardPage();
    render(component);

    expect(getOverviewData).toHaveBeenCalledWith(mockUser);
    expect(screen.getByTestId('overview-data')).toHaveTextContent(JSON.stringify(mockOverviewData));
  });

  it('should propagate errors from requireInternalUser', async () => {
    const error = new Error('Unauthorized');
    vi.mocked(requireInternalUser).mockRejectedValue(error);

    await expect(OverviewDashboardPage()).rejects.toThrow('Unauthorized');
  });

  it('should propagate errors from getOverviewData', async () => {
    const error = new Error('Failed to fetch data');
    vi.mocked(getOverviewData).mockRejectedValue(error);

    await expect(OverviewDashboardPage()).rejects.toThrow('Failed to fetch data');
  });
});
