import type { SprintData } from '../types';

// Using static dates to avoid hydration issues
export const MOCK_SPRINT: Readonly<SprintData> = {
  id: '1',
  name: 'Sprint 4',
  projectName: 'Acme Website Redesign',
  startDate: '2025-11-16T00:00:00Z',
  endDate: '2025-11-30T00:00:00Z',
  totalTasks: 24,
  completedTasks: 14,
  inProgressTasks: 6,
  blockedTasks: 1,
  daysRemaining: 7,
  burndownData: [
    { value: 24, label: 'Day 1' },
    { value: 22, label: 'Day 2' },
    { value: 20, label: 'Day 3' },
    { value: 18, label: 'Day 4' },
    { value: 16, label: 'Day 5' },
    { value: 14, label: 'Day 6' },
    { value: 10, label: 'Day 7' },
  ],
  velocity: 14,
  previousVelocity: 12,
} as const;
