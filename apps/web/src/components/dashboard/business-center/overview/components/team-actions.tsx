import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@tabler/icons-react';

interface TeamActionsProps {
  readonly href?: string;
  readonly label?: string;
}

export const TeamActions = ({
  href = '/dashboard/business-center/team-capacity',
  label = 'View team capacity',
}: TeamActionsProps) => {
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
