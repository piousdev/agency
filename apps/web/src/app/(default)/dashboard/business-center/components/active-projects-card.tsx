'use client';

import { useState } from 'react';
import { Code, FileText, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BentoCard,
  BentoCardContent,
  BentoCardFooter,
  BentoCardHeader,
} from '@/components/ui/bento-grid';
import { TimePeriodSelector, type TimePeriod } from './time-period-selector';
import { InfoTooltip } from './info-tooltip';
import { CardActionButton } from './card-action-button';

interface ActiveProjectsCardProps {
  contentCount: number;
  softwareCount: number;
}

export function ActiveProjectsCard({ contentCount, softwareCount }: ActiveProjectsCardProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1M');
  const total = contentCount + softwareCount;
  const maxValue = Math.max(contentCount, softwareCount, 1);

  const projects = [
    {
      label: 'Content',
      count: contentCount,
      icon: FileText,
      color: 'bg-chart-1',
      textColor: 'text-chart-1',
      href: '/dashboard/business-center/content-projects',
      width: `${(contentCount / maxValue) * 100}%`,
    },
    {
      label: 'Software',
      count: softwareCount,
      icon: Code,
      color: 'bg-chart-2',
      textColor: 'text-chart-2',
      href: '/dashboard/business-center/software-projects',
      width: `${(softwareCount / maxValue) * 100}%`,
    },
  ];

  return (
    <BentoCard
      aria-label={`Active Projects: ${total} total - ${contentCount} content, ${softwareCount} software`}
    >
      {/* Watermark Icon */}
      <div className="absolute -top-6 -right-6 opacity-[0.03] pointer-events-none">
        <FolderOpen className="w-40 h-40" />
      </div>

      <BentoCardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FolderOpen className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Active Projects
            </h3>
            <InfoTooltip content="Projects currently in progress, split by content and software categories." />
          </div>
        </div>
        <TimePeriodSelector value={timePeriod} onChange={setTimePeriod} />
      </BentoCardHeader>

      <BentoCardContent className="flex items-center gap-6">
        {/* Left side - Main Metric (20%) */}
        <div className="w-[20%] shrink-0">
          <div className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            {total}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Total active</p>
        </div>

        {/* Right side - Project Breakdown (80%) */}
        <div className="flex-1 space-y-3">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <div key={project.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', project.textColor)} />
                    <span className="text-sm font-medium text-muted-foreground">
                      {project.label}
                    </span>
                  </div>
                  <span className={cn('text-lg font-bold', project.textColor)}>
                    {project.count}
                  </span>
                </div>
                <div
                  className="h-2 w-full bg-muted/20 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={project.count}
                  aria-valuemin={0}
                  aria-valuemax={maxValue}
                  aria-label={`${project.label} projects: ${project.count}`}
                >
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500 motion-reduce:transition-none',
                      project.color
                    )}
                    style={{ width: project.width }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </BentoCardContent>

      <BentoCardFooter>
        <CardActionButton href="/dashboard/projects/active" label="View All Projects" />
      </BentoCardFooter>
    </BentoCard>
  );
}
