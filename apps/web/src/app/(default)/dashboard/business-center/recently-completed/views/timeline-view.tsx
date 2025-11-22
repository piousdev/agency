import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, CheckCircle2, Users } from 'lucide-react';
import type { ProjectWithRelations } from '@/lib/api/projects/types';

interface CompletedTimelineViewProps {
  projects: ProjectWithRelations[];
}

const projectTypeColors = {
  creative: 'default',
  software: 'secondary',
} as const;

export function CompletedTimelineView({ projects }: CompletedTimelineViewProps) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No completed projects found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project, index) => {
        const deliveredDate = new Date(project.deliveredAt || project.updatedAt);
        const isRecent =
          index === 0 || deliveredDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        return (
          <div key={project.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`rounded-full p-2 ${isRecent ? 'bg-green-500' : 'bg-muted'}`}>
                <CheckCircle2
                  className={`h-4 w-4 ${isRecent ? 'text-white' : 'text-muted-foreground'}`}
                />
              </div>
              {index < projects.length - 1 && <div className="w-px h-full bg-border mt-2" />}
            </div>

            <Card className="flex-1 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg line-clamp-1">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        projectTypeColors[project.client?.type as keyof typeof projectTypeColors] ||
                        'secondary'
                      }
                    >
                      {project.client?.type === 'creative'
                        ? 'Content'
                        : project.client?.type || 'N/A'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{project.client?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {project.assignees && project.assignees.length > 0
                          ? `${project.assignees.length} team ${project.assignees.length === 1 ? 'member' : 'members'}`
                          : 'No team'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Delivered {format(deliveredDate, 'MMM d, yyyy')}
                    </span>
                    <span className="text-sm font-medium">
                      {formatDistanceToNow(deliveredDate, { addSuffix: true })}
                    </span>
                  </div>

                  {project.assignees && project.assignees.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.assignees.slice(0, 5).map((assignee) => (
                        <Badge key={assignee.id} variant="outline" className="text-xs">
                          {assignee.name}
                        </Badge>
                      ))}
                      {project.assignees.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.assignees.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
