import { IconArrowRight } from '@tabler/icons-react';

import { CardFooter } from '@/components/default/dashboard/business-center/overview/components/card-footer';

interface DeadlineActionsProps {
  calendarHref?: string;
}

export function DeadlineActions({
  calendarHref = '/dashboard/projects/views/calendar',
}: DeadlineActionsProps) {
  return (
    <CardFooter
      href={calendarHref}
      label="View calendar"
      icon={IconArrowRight}
      classNames={{ icon: 'size-5' }}
      data-testid="deadline-actions"
      aria-label="View calendar"
    />
  );
}
