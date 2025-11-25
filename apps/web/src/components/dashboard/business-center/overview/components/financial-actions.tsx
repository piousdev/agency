import { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@tabler/icons-react';
import { FINANCIAL_URLS } from '@/components/dashboard/business-center/overview/constants/financial-config';
import type { WidgetVariant } from '@/components/dashboard/business-center/overview/types';

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
