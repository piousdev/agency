import { IconCalendar, IconCode, IconPalette } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import type { ProjectWithRelations } from '@/lib/api/projects/types';

/**
 * Delivery Calendar Props
 */
interface DeliveryCalendarProps {
  projects: ProjectWithRelations[];
}

/**
 * Group projects by delivery date
 */
function groupByDeliveryDate(projects: ProjectWithRelations[]) {
  const grouped: Record<string, ProjectWithRelations[]> = {};

  projects.forEach((project) => {
    if (project.deliveredAt) {
      const date = new Date(project.deliveredAt).toDateString();
      grouped[date] ??= [];
      grouped[date].push(project);
    }
  });

  // Sort dates chronologically
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const sorted: Record<string, ProjectWithRelations[]> = {};
  sortedDates.forEach((date) => {
    sorted[date] = grouped[date];
  });

  return sorted;
}

/**
 * Get service type icon
 */
function getServiceIcon(clientType: string) {
  if (clientType === 'creative') {
    return <IconPalette className="h-4 w-4" />;
  }
  return <IconCode className="h-4 w-4" />;
}

/**
 * Get service type color
 */
function getServiceColor(clientType: string) {
  if (clientType === 'creative') {
    return 'text-primary bg-primary/10 border-primary/20';
  }
  return 'text-success bg-success/10 border-success/20';
}

/**
 * Delivery Calendar Component (Server Component)
 * Displays upcoming project deliveries organized by date
 */
export function DeliveryCalendar({ projects }: DeliveryCalendarProps) {
  // Filter projects with delivery dates
  const upcomingDeliveries = projects.filter(
    (p) => p.deliveredAt && new Date(p.deliveredAt) >= new Date()
  );

  const projectsByDate = groupByDeliveryDate(upcomingDeliveries);
  const dates = Object.keys(projectsByDate);

  if (dates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <IconCalendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No upcoming deliveries</p>
        <p className="text-xs mt-1">Delivery schedule will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dates.map((dateStr) => {
        const projectsOnDate = projectsByDate[dateStr];
        if (!projectsOnDate) return null;

        const date = new Date(dateStr);
        const isMultiple = projectsOnDate.length > 1;

        return (
          <div key={dateStr} className="space-y-2">
            {/* Date Header */}
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold">
                {date.toLocaleDateString('en-BE', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              {isMultiple && (
                <Badge
                  variant="outline"
                  className="text-xs text-warning bg-warning/10 border-warning/20"
                >
                  {projectsOnDate.length} deliveries
                </Badge>
              )}
            </div>

            {/* Projects for this date */}
            <div className="space-y-2">
              {projectsOnDate.map((project) => {
                const serviceColor = getServiceColor(project.client.type);
                const ServiceIcon = () => getServiceIcon(project.client.type);

                return (
                  <Card
                    key={project.id}
                    className={`hover:bg-muted/50 transition-colors ${isMultiple ? 'border-warning/30' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <ServiceIcon />
                            <h4 className="font-medium text-sm line-clamp-1">{project.name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">{project.client.name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className={serviceColor}>
                            {project.client.type === 'creative' ? 'Content' : 'Software'}
                          </Badge>
                          {project.status === 'in_review' && (
                            <Badge
                              variant="outline"
                              className="text-xs text-warning bg-warning/10 border-warning/20"
                            >
                              In Review
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
