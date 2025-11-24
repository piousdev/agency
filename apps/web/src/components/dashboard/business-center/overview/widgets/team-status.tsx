'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconArrowRight } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useOverviewData } from '../overview-dashboard';

type TeamMemberStatus = 'available' | 'busy' | 'at_capacity' | 'overloaded' | 'away';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  status: TeamMemberStatus;
  currentProject?: string;
  tasksInProgress: number;
}

// Mock data
const MOCK_TEAM: TeamMember[] = [
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
];

export interface TeamStatusWidgetProps {
  team?: TeamMember[];
  className?: string;
}

export function TeamStatusWidget({ team: propTeam, className }: TeamStatusWidgetProps) {
  const overviewData = useOverviewData();

  // Transform server data to widget format if available
  const team: TeamMember[] = overviewData?.teamStatus
    ? overviewData.teamStatus.map((m) => ({
        id: m.id,
        name: m.name,
        role: 'Team Member', // Server doesn't provide role
        image: m.image || undefined,
        status: m.status === 'overloaded' ? 'overloaded' : m.status,
        currentProject: undefined,
        tasksInProgress: m.activeTasks,
      }))
    : propTeam || MOCK_TEAM;

  const statusColors: Record<TeamMemberStatus, string> = {
    available: 'bg-success',
    busy: 'bg-primary',
    at_capacity: 'bg-warning',
    overloaded: 'bg-destructive',
    away: 'bg-muted-foreground',
  };

  const statusLabels: Record<TeamMemberStatus, string> = {
    available: 'Available',
    busy: 'Busy',
    at_capacity: 'At Capacity',
    overloaded: 'Overloaded',
    away: 'Away',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Summary stats
  const stats = {
    available: team.filter((m) => m.status === 'available').length,
    busy: team.filter((m) => m.status === 'busy' || m.status === 'at_capacity').length,
    overloaded: team.filter((m) => m.status === 'overloaded').length,
    totalTasks: team.reduce((sum, m) => sum + m.tasksInProgress, 0),
    avgTasks:
      team.length > 0
        ? Math.round((team.reduce((sum, m) => sum + m.tasksInProgress, 0) / team.length) * 10) / 10
        : 0,
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Summary */}
      <div className="mb-4 pb-4 border-b space-y-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="text-xs">
              <strong>{stats.available}</strong> available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span className="text-xs">
              <strong>{stats.busy}</strong> busy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
            <span className="text-xs">
              <strong>{stats.overloaded}</strong> overloaded
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">{stats.totalTasks}</strong> total tasks
          </span>
          <span>
            <strong className="text-foreground">{stats.avgTasks}</strong> avg/member
          </span>
        </div>
      </div>

      {/* Team List */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {team.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                    statusColors[member.status]
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.role}</p>
              </div>
              <div className="text-right">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    member.status === 'overloaded' &&
                      'border-destructive/20 bg-destructive/10 text-destructive'
                  )}
                >
                  {member.tasksInProgress} tasks
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/business-center/team-capacity">
            View team capacity
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
