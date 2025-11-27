import type { ActivityItem } from '../types';

// Using static timestamps to avoid hydration mismatches
export const MOCK_ACTIVITIES: readonly ActivityItem[] = [
  {
    id: '1',
    type: 'comment_added',
    description: 'commented on "Homepage Design Review"',
    timestamp: '2025-11-23T13:50:00Z',
    user: { name: 'Sarah Chen' },
    metadata: { projectName: 'Acme Website Redesign' },
  },
  {
    id: '2',
    type: 'task_completed',
    description: 'completed "Setup CI/CD pipeline"',
    timestamp: '2025-11-23T13:30:00Z',
    user: { name: 'Mike Johnson' },
    metadata: { projectName: 'TechCorp Mobile App' },
  },
  {
    id: '3',
    type: 'file_uploaded',
    description: 'uploaded "final-mockups.fig"',
    timestamp: '2025-11-23T12:00:00Z',
    user: { name: 'Emily Davis' },
    metadata: { fileName: 'final-mockups.fig' },
  },
  {
    id: '4',
    type: 'member_joined',
    description: 'joined the project',
    timestamp: '2025-11-23T10:00:00Z',
    user: { name: 'Alex Kim' },
    metadata: { projectName: 'Internal Dashboard' },
  },
  {
    id: '5',
    type: 'project_created',
    description: 'created a new project',
    timestamp: '2025-11-22T14:00:00Z',
    user: { name: 'Jordan Lee' },
    metadata: { projectName: 'New Client Onboarding' },
  },
] as const;
