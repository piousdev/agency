import type { DeadlineItem } from '@/components/dashboard/business-center/overview/types';

export const MOCK_DEADLINES: DeadlineItem[] = [
  {
    id: '1',
    title: 'Homepage Design Review',
    type: 'milestone',
    dueAt: new Date().toISOString(),
    projectName: 'Acme Website Redesign',
    clientName: 'Acme Corp',
    isOverdue: false,
  },
  {
    id: '2',
    title: 'Phase 1 Delivery',
    type: 'deliverable',
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    projectName: 'TechCorp Mobile App',
    clientName: 'TechCorp',
  },
  {
    id: '3',
    title: 'Sprint 3 End',
    type: 'milestone',
    dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    projectName: 'Internal Dashboard',
  },
  {
    id: '4',
    title: 'Final Presentation',
    type: 'project',
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    projectName: 'Acme Website Redesign',
    clientName: 'Acme Corp',
  },
];
