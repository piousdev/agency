import { memo } from 'react';

import Link from 'next/link';

import { IconArrowRight } from '@tabler/icons-react';

import { BLOCKER_URLS } from '@/components/default/dashboard/business-center/overview/constants/blocker-config';
import { Button } from '@/components/ui/button';

interface BlockersFooterProps {
  readonly href?: string;
  readonly label?: string;
}

export const BlockersFooter = memo(function BlockersFooter({
  href = BLOCKER_URLS.allBlockers,
  label = 'View all blockers',
}: BlockersFooterProps) {
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
