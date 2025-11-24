import {
  IconCalendar,
  IconCircleCheck,
  IconCode,
  IconPalette,
  IconUsers,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProjectWithRelations } from '@/lib/api/projects/types';
import type { TicketWithRelations } from '@/lib/api/tickets/types';
import type { TeamMember } from '@/lib/api/users/types';
import { ActiveWorkContent } from './active-work-content';
import { ActiveWorkSoftware } from './active-work-software';
import { DeliveryCalendar } from './delivery-calendar';
import { RecentlyCompleted } from './recently-completed';
import { TeamCapacity } from './team-capacity';

/**
 * Business Center Data Interface
 * Defines the structure for all data passed from the server
 */
export interface BusinessCenterData {
  activeProjects: ProjectWithRelations[];
  teamMembers: TeamMember[];
  upcomingDeliveries: ProjectWithRelations[];
  recentlyCompleted: ProjectWithRelations[];
}

/**
 * Business Center Props
 */
interface BusinessCenterProps {
  data: BusinessCenterData;
}

/**
 * Business Center Layout Component
 *
 * 6-section dashboard layout:
 * 1. Intake Queue (top left)
 * 2. Active Work - Content (top middle)
 * 3. Active Work - Software (top right)
 * 4. Team Capacity (bottom left)
 * 5. Delivery Calendar (bottom middle)
 * 6. Recently Completed (bottom right)
 */
export function BusinessCenter({ data }: BusinessCenterProps) {
  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">Business Center</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Manage intake requests, active projects, team capacity, and deliveries
          </p>
        </div>
      </div>

      {/* 5-Section Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Section 1: Active Work - Content */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconPalette className="h-5 w-5 text-primary" />
              <CardTitle>Active Work - Content</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Creative projects in production</p>
          </CardHeader>
          <CardContent>
            <ActiveWorkContent projects={data.activeProjects} teamMembers={data.teamMembers} />
          </CardContent>
        </Card>

        {/* Section 3: Active Work - Software */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconCode className="h-5 w-5 text-success" />
              <CardTitle>Active Work - Software</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Software development projects</p>
          </CardHeader>
          <CardContent>
            <ActiveWorkSoftware projects={data.activeProjects} teamMembers={data.teamMembers} />
          </CardContent>
        </Card>

        {/* Section 4: Team Capacity */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconUsers className="h-5 w-5 text-warning" />
              <CardTitle>Team Capacity</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Current team workload and availability
            </p>
          </CardHeader>
          <CardContent>
            <TeamCapacity teamMembers={data.teamMembers} />
          </CardContent>
        </Card>

        {/* Section 5: Delivery Calendar */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5 text-error" />
              <CardTitle>Delivery Calendar</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Upcoming project delivery dates</p>
          </CardHeader>
          <CardContent>
            <DeliveryCalendar projects={data.upcomingDeliveries} />
          </CardContent>
        </Card>

        {/* Section 6: Recently Completed */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IconCircleCheck className="h-5 w-5 text-success" />
              <CardTitle>Recently Completed</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Projects delivered in the last 14 days
            </p>
          </CardHeader>
          <CardContent>
            <RecentlyCompleted projects={data.recentlyCompleted} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
