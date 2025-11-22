import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Building2, Calendar, CalendarClock, Users } from 'lucide-react';
import type { ProjectWithRelations } from '@/lib/api/projects/types';

interface ProjectCardsViewProps {
  projects: ProjectWithRelations[];
}

const statusColors = {
  intake: 'secondary',
  proposal: 'default',
  in_development: 'default',
  in_review: 'default',
  delivered: 'default',
  on_hold: 'secondary',
} as const;

export function ProjectCardsView({ projects }: ProjectCardsViewProps) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No projects found matching your criteria
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const isOverdue =
          project.deliveredAt &&
          new Date(project.deliveredAt) < new Date() &&
          project.status !== 'delivered';

        return (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base line-clamp-2">{project.name}</CardTitle>
                <Badge variant="outline" className="shrink-0">
                  {project.client?.type === 'creative' ? 'Content' : project.client?.type || 'N/A'}
                </Badge>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {project.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{project.client?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                <span className={isOverdue ? 'text-destructive' : ''}>
                  {project.deliveredAt
                    ? `Due ${format(new Date(project.deliveredAt), 'MMM d, yyyy')}${isOverdue ? ' (Overdue)' : ''}`
                    : 'No delivery date'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {project.assignees && project.assignees.length > 0
                    ? `${project.assignees.length} team ${project.assignees.length === 1 ? 'member' : 'members'}`
                    : 'No team assigned'}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.completionPercentage || 0}%</span>
                </div>
                <Progress value={project.completionPercentage || 0} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Badge variant={statusColors[project.status]}>
                {project.status.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {project.createdAt && format(new Date(project.createdAt), 'MMM d, yyyy')}
              </span>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
