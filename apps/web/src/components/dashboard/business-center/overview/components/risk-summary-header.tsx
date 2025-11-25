import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { IconAlertTriangle } from '@tabler/icons-react';
import { SEVERITY_CONFIG, SUMMARY_SEVERITIES } from '../constants/risk-config';
import type { RiskSummary, RiskSeverity } from '../types';

interface SeverityBadgeProps {
  readonly severity: RiskSeverity;
  readonly count: number;
}

const SeverityBadge = memo(function SeverityBadge({ severity, count }: SeverityBadgeProps) {
  if (count === 0) return null;

  const config = SEVERITY_CONFIG[severity];

  return (
    <Badge className={`${config.badgeClass} text-xs px-1.5`}>
      {count} {config.label}
    </Badge>
  );
});

interface RiskSummaryHeaderProps {
  readonly summary: RiskSummary;
}

export const RiskSummaryHeader = memo(function RiskSummaryHeader({
  summary,
}: RiskSummaryHeaderProps) {
  const severityCounts: Record<RiskSeverity, number> = {
    critical: summary.critical,
    high: summary.high,
    medium: summary.medium,
    low: summary.low,
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center gap-1.5">
        <IconAlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
        <span className="font-medium">
          {summary.total} Active Risk{summary.total !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex gap-1.5 ml-auto">
        {SUMMARY_SEVERITIES.map((severity) => (
          <SeverityBadge key={severity} severity={severity} count={severityCounts[severity]} />
        ))}
      </div>
    </div>
  );
});
