import type { TeamMember } from '../types';

export const MOCK_TEAM: readonly TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Lead Designer',
    status: 'busy',
    currentProject: 'Acme Website Redesign',
    tasksInProgress: 3,
  },
  {
    id: '2',
    name: 'Mike Johnson',
    role: 'Senior Developer',
    status: 'at_capacity',
    currentProject: 'TechCorp Mobile App',
    tasksInProgress: 5,
  },
  {
    id: '3',
    name: 'Emily Davis',
    role: 'UX Designer',
    status: 'available',
    tasksInProgress: 1,
  },
  {
    id: '4',
    name: 'Alex Kim',
    role: 'Developer',
    status: 'overloaded',
    currentProject: 'Internal Dashboard',
    tasksInProgress: 7,
  },
  {
    id: '5',
    name: 'Jordan Lee',
    role: 'Project Manager',
    status: 'busy',
    currentProject: 'Multiple Projects',
    tasksInProgress: 4,
  },
] as const;
