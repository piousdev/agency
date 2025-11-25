import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowRight, IconDownload } from '@tabler/icons-react';
import { exportDeadlinesToCalendar } from '@/components/dashboard/business-center/overview/utils/ical-export';
import type { DeadlineItem } from '@/components/dashboard/business-center/overview/types';

interface DeadlineActionsProps {
  deadlines: DeadlineItem[];
  calendarHref?: string;
}

export function DeadlineActions({
  deadlines,
  calendarHref = '/dashboard/projects/views/calendar',
}: DeadlineActionsProps) {
  const handleExport = () => exportDeadlinesToCalendar(deadlines);

  return (
    <div className="pt-3 mt-auto border-t flex items-center gap-2">
      <Button variant="ghost" size="sm" className="flex-1 justify-between" asChild>
        <Link href={calendarHref}>
          View calendar
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="outline" size="sm" onClick={handleExport} title="Export to calendar">
        <IconDownload className="h-4 w-4" />
      </Button>
    </div>
  );
}
