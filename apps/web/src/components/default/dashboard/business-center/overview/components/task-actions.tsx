import Link from 'next/link';

import { IconArrowRight } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

import { ALL_TASKS_URL } from '../constants/task-config';

interface TaskActionsFooterProps {
  readonly href?: string;
  readonly label?: string;
}

export const TaskActionsFooter = ({
  href = ALL_TASKS_URL,
  label = 'View all my tasks',
}: TaskActionsFooterProps) => {
  return (
    <div className="pt-3 mt-auto border-t">
      <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
        <Link href={href}>
          {label}
          <IconArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
};
