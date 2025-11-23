import { IconCircleCheck, IconCode, IconPalette, IconUsers } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ProjectWithRelations } from '@/lib/api/projects/types';

/**
 * Recently Completed Props
 */
interface RecentlyCompletedProps {
  projects: ProjectWithRelations[];
}

/**
 * Get service type icon and color
 */
function getServiceStyle(clientType: string) {
  if (clientType === 'creative') {
    return {
      icon: IconPalette,
      label: 'Content',
      color: 'text-primary bg-primary/10 border-primary/20',
    };
  }
  return {
    icon: IconCode,
    label: 'Software',
    color: 'text-success bg-success/10 border-success/20',
  };
}

/**
 * Recently Completed Component (Server Component)
 * Displays projects delivered in the last 14 days
 */
export function RecentlyCompleted({ projects }: RecentlyCompletedProps) {
  // Filter delivered projects from last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const recentlyCompleted = projects
    .filter((p) => {
      if (p.status !== 'delivered' || !p.deliveredAt) return false;
      const deliveredDate = new Date(p.deliveredAt);
      return deliveredDate >= fourteenDaysAgo;
    })
    .sort((a, b) => {
      // Sort by deliveredAt descending (most recent first)
      const dateA = new Date(a.deliveredAt!).getTime();
      const dateB = new Date(b.deliveredAt!).getTime();
      return dateB - dateA;
    });

  if (recentlyCompleted.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <IconCircleCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recently completed projects</p>
        <p className="text-xs mt-1">Completed projects will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recently Completed ({recentlyCompleted.length})</h3>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          Last 14 days
        </Badge>
      </div>

      {/* Projects Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Completed</TableHead>
              <TableHead className="text-center">Team</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentlyCompleted.map((project) => {
              const serviceStyle = getServiceStyle(project.client.type);
              const ServiceIcon = serviceStyle.icon;

              return (
                <TableRow key={project.id} className="hover:bg-muted/50">
                  {/* Project Name */}
                  <TableCell>
                    <div className="font-medium">{project.name}</div>
                  </TableCell>

                  {/* Client */}
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{project.client.name}</div>
                  </TableCell>

                  {/* Service Type */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className={serviceStyle.color}>
                      <ServiceIcon className="h-3 w-3 mr-1" />
                      {serviceStyle.label}
                    </Badge>
                  </TableCell>

                  {/* Completion Date */}
                  <TableCell className="text-center">
                    <div className="text-sm">
                      {new Date(project.deliveredAt!).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </TableCell>

                  {/* Team Members */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      {project.assignees.length > 0 ? (
                        <>
                          {project.assignees.slice(0, 3).map((assignee) => (
                            <div
                              key={assignee.id}
                              className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium"
                              title={assignee.name}
                            >
                              {assignee.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {project.assignees.length > 3 && (
                            <Badge variant="outline" className="text-xs ml-1">
                              +{project.assignees.length - 3}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">No team</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
