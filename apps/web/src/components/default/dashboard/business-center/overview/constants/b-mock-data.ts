import type { BlockerItem } from '@/components/default/dashboard/business-center/overview/types';

export const MOCK_BLOCKERS: readonly BlockerItem[] = [
  {
    id: '1',
    title: 'Waiting for client API credentials',
    severity: 'critical',
    projectName: 'TechCorp Mobile App',
    daysBlocked: 3,
    reason: 'External dependency',
  },
  {
    id: '2',
    title: 'Design approval pending',
    severity: 'high',
    projectName: 'Acme Website Redesign',
    daysBlocked: 2,
    assignee: 'Sarah Chen',
    reason: 'Client review',
  },
  {
    id: '3',
    title: 'Database migration conflict',
    severity: 'medium',
    projectName: 'Internal Dashboard',
    daysBlocked: 1,
    assignee: 'Mike Johnson',
    reason: 'Technical issue',
  },
] as const;
