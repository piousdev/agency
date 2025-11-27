import Link from 'next/link';

import { IconCalendar, IconTimeline, IconLayoutGrid, IconList } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth/session';

const views = [
  {
    title: 'List View',
    description: 'Detailed table view with all project information',
    icon: IconList,
    href: '/dashboard/projects/views/list',
  },
  {
    title: 'Board View',
    description: 'Kanban-style board grouped by project status',
    icon: IconLayoutGrid,
    href: '/dashboard/projects/views/board',
  },
  {
    title: 'Calendar View',
    description: 'Monthly calendar showing projects by delivery date',
    icon: IconCalendar,
    href: '/dashboard/projects/views/calendar',
  },
  {
    title: 'Timeline View',
    description: 'Gantt-style timeline sorted by due dates',
    icon: IconTimeline,
    href: '/dashboard/projects/views/timeline',
  },
];

export default async function ProjectViewsPage() {
  await requireUser();

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      <div>
        <h1 className="text-4xl font-bold">Project Views</h1>
        <p className="text-muted-foreground mt-2">Choose how you want to visualize your projects</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <Link key={view.href} href={view.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{view.title}</CardTitle>
                  <CardDescription>{view.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Open View
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> You can set your default view in{' '}
            <Link href="/dashboard/projects/settings" className="text-primary hover:underline">
              Project Settings
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
