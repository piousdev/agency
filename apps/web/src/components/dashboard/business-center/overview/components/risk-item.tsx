import { memo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { IconChevronRight } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  SEVERITY_CONFIG,
  CATEGORY_CONFIG,
} from '@/components/dashboard/business-center/overview/constants/risk-config';
import {
  getCategoryIcon,
  getProjectUrl,
} from '@/components/dashboard/business-center/overview/utils/risk';
import type { RiskIndicator } from '@/components/dashboard/business-center/overview/types';

interface RiskItemHeaderProps {
  readonly category: RiskIndicator['category'];
  readonly severity: RiskIndicator['severity'];
}

const RiskItemHeader = memo(function RiskItemHeader({ category, severity }: RiskItemHeaderProps) {
  const CategoryIcon = getCategoryIcon(category);
  const categoryLabel = CATEGORY_CONFIG[category]?.label ?? category;
  const severityConfig = SEVERITY_CONFIG[severity];

  return (
    <div className="flex items-start justify-between gap-2 mb-1">
      <div className="flex items-center gap-2">
        <CategoryIcon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
        <span className="text-xs text-muted-foreground capitalize">{categoryLabel}</span>
      </div>
      <Badge className={cn('text-xs', severityConfig.badgeClass)}>{severityConfig.label}</Badge>
    </div>
  );
});

interface RiskItemContentProps {
  readonly description: string;
  readonly impact: string;
  readonly mitigation?: string;
}

const RiskItemContent = memo(function RiskItemContent({
  description,
  impact,
  mitigation,
}: RiskItemContentProps) {
  return (
    <>
      <p className="text-sm font-medium mb-1">{description}</p>
      <p className="text-xs text-muted-foreground mb-2">
        <span className="font-medium">Impact:</span> {impact}
      </p>
      {mitigation && (
        <p className="text-xs text-success">
          <span className="font-medium">Mitigation:</span> {mitigation}
        </p>
      )}
    </>
  );
});

interface RiskItemFooterProps {
  readonly projectId: string;
  readonly projectName: string;
}

const RiskItemFooter = memo(function RiskItemFooter({
  projectId,
  projectName,
}: RiskItemFooterProps) {
  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
      <span className="text-xs text-muted-foreground">{projectName}</span>
      <Link
        href={getProjectUrl(projectId)}
        className="text-xs text-primary hover:underline flex items-center gap-0.5"
      >
        View Project
        <IconChevronRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
});

interface RiskItemProps {
  readonly risk: RiskIndicator;
}

export const RiskItem = memo(function RiskItem({ risk }: RiskItemProps) {
  const borderClass = SEVERITY_CONFIG[risk.severity].borderClass;

  return (
    <div className={cn('p-3 rounded-lg bg-muted/50 border-l-4', borderClass)}>
      <RiskItemHeader category={risk.category} severity={risk.severity} />
      <RiskItemContent
        description={risk.description}
        impact={risk.impact}
        mitigation={risk.mitigation}
      />
      <RiskItemFooter projectId={risk.projectId} projectName={risk.projectName} />
    </div>
  );
});
