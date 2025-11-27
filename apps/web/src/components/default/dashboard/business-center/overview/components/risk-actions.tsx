import { memo } from 'react';

import Link from 'next/link';

import { IconArrowRight } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

interface RiskActionsProps {
  readonly href?: string;
  readonly label?: string;
}

export const RiskActions = memo(function RiskActions({
  href = '/dashboard/business-center/projects?view=risks',
  label = 'View all risks',
}: RiskActionsProps) {
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
});
