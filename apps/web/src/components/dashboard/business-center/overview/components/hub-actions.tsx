import { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@tabler/icons-react';
import { HUB_URLS } from '@/components/dashboard/business-center/overview/constants/notification-config';

interface HubActionsProps {
  readonly href?: string;
  readonly label?: string;
}

export const HubActions = memo(function HubActions({
  href = HUB_URLS.messages,
  label = 'View all messages',
}: HubActionsProps) {
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
