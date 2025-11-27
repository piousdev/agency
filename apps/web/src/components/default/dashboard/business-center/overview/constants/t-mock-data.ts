import type { TaskItem } from '../types';

// Using static timestamps to avoid hydration mismatches
export const MOCK_TASKS: readonly TaskItem[] = [
  {
    id: '1',
    title: 'Review client feedback on homepage redesign',
    projectName: 'Acme Website Redesign',
    priority: 'high',
    dueAt: '2025-11-23T14:00:00Z',
    status: 'in_progress',
    ticketNumber: 'TKT-001',
  },
  {
    id: '2',
    title: 'Fix navigation bug on mobile',
    projectName: 'TechCorp Mobile App',
    priority: 'critical',
    dueAt: '2025-11-23T16:00:00Z',
    status: 'open',
    ticketNumber: 'TKT-002',
  },
  {
    id: '3',
    title: 'Update API documentation',
    projectName: 'Internal Tools',
    priority: 'medium',
    status: 'open',
    ticketNumber: 'TKT-003',
  },
  {
    id: '4',
    title: 'Implement user settings page',
    projectName: 'Acme Website Redesign',
    priority: 'medium',
    dueAt: '2025-11-24T14:00:00Z',
    status: 'pending_client',
    ticketNumber: 'TKT-004',
  },
] as const;
