'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  IconArrowRight,
  IconAlertTriangle,
  IconClock,
  IconCurrencyDollar,
  IconTarget,
  IconUsers,
  IconShieldCheck,
  IconChevronRight,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useOverviewData } from '../overview-dashboard';
import type { RiskSummary, RiskIndicator } from '@/lib/actions/business-center/overview';

// Mock data for when no server data is available
const MOCK_RISK_SUMMARY: RiskSummary = {
  total: 3,
  critical: 0,
  high: 1,
  medium: 1,
  low: 1,
  risks: [
    {
      id: 'risk-1',
      category: 'schedule',
      projectId: 'proj-1',
      projectName: 'Acme Website Redesign',
      severity: 'high',
      description: 'Sprint velocity below target for 2 consecutive sprints',
      impact: 'May miss Q1 deadline',
      mitigation: 'Adding additional developer resource',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'risk-2',
      category: 'budget',
      projectId: 'proj-2',
      projectName: 'TechCorp Mobile App',
      severity: 'medium',
      description: 'Budget utilization at 85% with 30% work remaining',
      impact: 'Potential budget overrun of 15-20%',
      mitigation: 'Scope review scheduled with client',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'risk-3',
      category: 'resource',
      projectId: 'proj-1',
      projectName: 'Acme Website Redesign',
      severity: 'low',
      description: 'Key developer on PTO next week',
      impact: 'Minor delay in API integration',
      createdAt: new Date().toISOString(),
    },
  ],
};

export interface RiskIndicatorsWidgetProps {
  data?: RiskSummary;
  className?: string;
}

export function RiskIndicatorsWidget({ data: propData, className }: RiskIndicatorsWidgetProps) {
  const overviewData = useOverviewData();
  const data = overviewData?.riskSummary || propData || MOCK_RISK_SUMMARY;

  if (!data || data.total === 0) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center h-full text-center', className)}
      >
        <IconShieldCheck className="h-8 w-8 text-success mb-2" />
        <p className="font-medium">No Active Risks</p>
        <p className="text-sm text-muted-foreground mt-1">All projects are on track</p>
      </div>
    );
  }

  const severityColors: Record<string, string> = {
    critical: 'bg-destructive text-destructive-foreground',
    high: 'bg-destructive/80 text-destructive-foreground',
    medium: 'bg-warning text-warning-foreground',
    low: 'bg-muted text-muted-foreground',
  };

  const severityBorderColors: Record<string, string> = {
    critical: 'border-l-destructive',
    high: 'border-l-destructive/80',
    medium: 'border-l-warning',
    low: 'border-l-muted-foreground',
  };

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    schedule: IconClock,
    budget: IconCurrencyDollar,
    scope: IconTarget,
    resource: IconUsers,
    quality: IconShieldCheck,
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Risk Summary */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5">
          <IconAlertTriangle className="h-4 w-4 text-warning" />
          <span className="font-medium">{data.total} Active Risks</span>
        </div>
        <div className="flex gap-1.5 ml-auto">
          {data.critical > 0 && (
            <Badge variant="destructive" className="text-xs px-1.5">
              {data.critical} Critical
            </Badge>
          )}
          {data.high > 0 && (
            <Badge className="bg-destructive/80 text-destructive-foreground text-xs px-1.5">
              {data.high} High
            </Badge>
          )}
          {data.medium > 0 && (
            <Badge className="bg-warning text-warning-foreground text-xs px-1.5">
              {data.medium} Medium
            </Badge>
          )}
        </div>
      </div>

      {/* Risk List */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {data.risks.map((risk) => {
            const CategoryIcon = categoryIcons[risk.category] || IconAlertTriangle;
            return (
              <div
                key={risk.id}
                className={cn(
                  'p-3 rounded-lg bg-muted/50 border-l-4',
                  severityBorderColors[risk.severity]
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground capitalize">
                      {risk.category}
                    </span>
                  </div>
                  <Badge className={cn('text-xs', severityColors[risk.severity])}>
                    {risk.severity}
                  </Badge>
                </div>
                <p className="text-sm font-medium mb-1">{risk.description}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium">Impact:</span> {risk.impact}
                </p>
                {risk.mitigation && (
                  <p className="text-xs text-success">
                    <span className="font-medium">Mitigation:</span> {risk.mitigation}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">{risk.projectName}</span>
                  <Link
                    href={`/dashboard/business-center/projects/${risk.projectId}`}
                    className="text-xs text-primary hover:underline flex items-center gap-0.5"
                  >
                    View Project
                    <IconChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="pt-3 mt-auto border-t">
        <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
          <Link href="/dashboard/business-center/projects?view=risks">
            View all risks
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
