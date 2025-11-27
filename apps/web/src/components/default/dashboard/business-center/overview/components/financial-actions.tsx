import { memo } from 'react';

import { IconArrowRight } from '@tabler/icons-react';

import { CardFooter } from '@/components/default/dashboard/business-center/overview/components/card-footer';
import { FINANCIAL_URLS } from '@/components/default/dashboard/business-center/overview/constants/financial-config';

import type { WidgetVariant } from '@/components/default/dashboard/business-center/overview/types';

interface FinancialActionsProps {
  readonly variant: WidgetVariant;
}

const ACTION_CONFIG: Readonly<Record<WidgetVariant, { href: string; label: string }>> = {
  admin: {
    href: FINANCIAL_URLS.billing,
    label: 'View billing details',
  },
  client: {
    href: FINANCIAL_URLS.invoices,
    label: 'View invoices',
  },
} as const;

export const FinancialActions = memo(function FinancialActions({ variant }: FinancialActionsProps) {
  const { href, label } = ACTION_CONFIG[variant];

  return (
    <CardFooter
      href={href}
      label={label}
      icon={IconArrowRight}
      classNames={{ icon: 'size-5' }}
      data-testid="financial-actions"
      aria-label={label}
    />
  );
});
