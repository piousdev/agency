import { IconArrowRight } from '@tabler/icons-react';

import { CardFooter } from '@/components/default/dashboard/business-center/overview/components/card-footer';

interface TeamActionsProps {
  readonly href?: string;
  readonly label?: string;
}

export const TeamActions = ({
  href = '/dashboard/business-center/team-capacity',
  label = 'View team capacity',
}: TeamActionsProps) => {
  return (
    <CardFooter href={href} label={label} icon={IconArrowRight} classNames={{ icon: 'size-5' }} />
  );
};
