import { redirect } from 'next/navigation';

import { IconChartBar, IconCalendar } from '@tabler/icons-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth/session';

export default async function AnalyticsPage() {
  const user = await requireUser();

  if (!user.isInternal) redirect('/dashboard');

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="border-dashed">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <IconChartBar className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Analytics & Reports</CardTitle>
          <CardDescription className="text-base max-w-md mx-auto">
            Financial analytics, revenue tracking, and delivery metrics are coming soon.
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
              <span>Revenue Tracking</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">2</span>
              <span>Delivery Metrics</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">3</span>
              <span>Team Performance</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">4</span>
              <span>Project Profitability</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
