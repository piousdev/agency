import { redirect } from 'next/navigation';

import { IconChecklist, IconCalendar } from '@tabler/icons-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth/session';

export default async function WorkPage() {
  const user = await requireUser();

  if (!user.isInternal) redirect('/dashboard');

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <IconChecklist className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Work & Task Management</CardTitle>
          <CardDescription className="text-base max-w-md mx-auto">
            The dedicated work section for managing your tasks and daily work is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <IconCalendar className="w-4 h-4" />
            <span>Planned for a future release</span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-sm mx-auto text-sm text-muted-foreground">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">1</span>
              <span>My Tasks View</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">2</span>
              <span>Kanban Board</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">3</span>
              <span>Time Tracking</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">4</span>
              <span>Focus Mode</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
