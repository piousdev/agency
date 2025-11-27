import Link from 'next/link';

import { IconArrowRight } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

import { SPRINT_URLS } from '../constants/sprint-config';

interface SprintActionsProps {
  readonly href?: string;
  readonly label?: string;
}

export const SprintActions = ({
  href = SPRINT_URLS.board,
  label = 'View sprint board',
}: SprintActionsProps) => {
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
