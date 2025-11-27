import { IconArrowRight } from '@tabler/icons-react';

import { CardFooter } from '@/components/default/dashboard/business-center/overview/components/card-footer';

interface ActivityActionsProps {
  readonly href?: string;
  readonly label?: string;
}

export const ActivityActions = ({
  href = '/dashboard/collaboration/feed',
  label = 'View all activity',
}: ActivityActionsProps) => {
  return (
    <CardFooter href={href} label={label} icon={IconArrowRight} classNames={{ icon: 'size-5' }} />
  );
};
