import { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@tabler/icons-react';
import { ANALYTICS_URL } from '@/components/dashboard/business-center/overview/constants/health-config';

interface HealthActionsProps {
  readonly href?: string;
  readonly label?: string;
}

export const HealthActions = memo(function HealthActions({
  href = ANALYTICS_URL,
  label = 'View analytics',
}: HealthActionsProps) {
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
