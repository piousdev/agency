import Link from 'next/link';

import { IconCalendar, IconChevronLeft, IconChevronRight, IconPlus } from '@tabler/icons-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  
  
} from 'date-fns';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listProjects } from '@/lib/api/projects';
import { requireUser } from '@/lib/auth/session';

const statusColors: Record<string, string> = {
  proposal: 'bg-yellow-500',
  in_development: 'bg-blue-500',
  in_review: 'bg-purple-500',
  delivered: 'bg-green-500',
  on_hold: 'bg-red-500',
};

export default async function ProjectCalendarViewPage() {
  await requireUser();

  const projectsResponse = await listProjects({ pageSize: 100 });
  const projects = projectsResponse.data;

  // Filter projects with delivery dates
  const projectsWithDates = projects.filter((p) => p.deliveredAt);

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group projects by delivery date
  const projectsByDate = projectsWithDates.reduce<Record<string, typeof projects>>(
    (acc, project) => {
      if (project.deliveredAt) {
        const dateKey = format(new Date(project.deliveredAt), 'yyyy-MM-dd');
        acc[dateKey] ??= [];
        acc[dateKey].push(project);
      }
      return acc;
    },
    {}
  );

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get the day of the week for the first day of the month (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IconCalendar className="h-6 w-6" />
            <h1 className="text-4xl font-bold">Calendar View</h1>
          </div>
          <p className="text-muted-foreground mt-2">View projects by delivery date</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/projects/views/board">
            <Button variant="outline">Board View</Button>
          </Link>
          <Link href="/dashboard/projects/new">
            <Button className="gap-2">
              <IconPlus className="h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{format(today, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" disabled>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled>
                Today
              </Button>
              <Button variant="outline" size="icon" disabled>
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`empty-${String(index)}`} className="min-h-[100px] bg-muted/20 rounded-lg" />
            ))}

            {/* Days of the month */}
            {daysInMonth.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayProjects = projectsByDate[dateKey];
              const isToday = isSameDay(day, today);

              return (
                <div
                  key={dateKey}
                  className={`min-h-[100px] border rounded-lg p-2 ${
                    isToday ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayProjects.slice(0, 3).map((project) => (
                      <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                        <div
                          className={`text-xs p-1 rounded truncate text-white ${
                            statusColors[project.status] ?? 'bg-gray-500'
                          } hover:opacity-80 transition-opacity cursor-pointer`}
                          title={project.name}
                        >
                          {project.name}
                        </div>
                      </Link>
                    ))}
                    {dayProjects.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayProjects.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="text-sm font-medium text-muted-foreground">Status Legend:</div>
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded ${color}`} />
                <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {projectsWithDates.length} projects with delivery dates
      </div>
    </div>
  );
}
