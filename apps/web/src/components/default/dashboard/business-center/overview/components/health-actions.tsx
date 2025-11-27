import { IconArrowRight } from '@tabler/icons-react';

import { CardFooter } from '@/components/default/dashboard/business-center/overview/components/card-footer';
import { ANALYTICS_URL } from '@/components/default/dashboard/business-center/overview/constants/health-config';

interface HealthActionsProps {
  readonly href?: string;
  readonly label?: string;
}

export const HealthActions = ({
  href = ANALYTICS_URL,
  label = 'View analytics',
}: HealthActionsProps) => {
  return (
    <CardFooter
      href={href}
      label={label}
      icon={IconArrowRight}
      className="mt-3"
      classNames={{ icon: 'size-5' }}
      aria-label={label}
      data-testid="health-actions"
    />
  );
};
