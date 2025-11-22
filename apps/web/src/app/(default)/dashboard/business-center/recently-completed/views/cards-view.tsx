import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, CheckCircle2, Users } from 'lucide-react';
import type { ProjectWithRelations } from '@/lib/api/projects/types';

interface CompletedCardsViewProps {
  projects: ProjectWithRelations[];
}

const projectTypeColors = {
  creative: 'default',
  software: 'secondary',
} as const;

export function CompletedCardsView({ projects }: CompletedCardsViewProps) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No completed projects found
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base line-clamp-2">{project.name}</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
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
              <Calendar className="h-4 w-4" />
              <span>
                Delivered{' '}
                {project.deliveredAt
                  ? format(new Date(project.deliveredAt), 'MMM d, yyyy')
                  : format(new Date(project.updatedAt), 'MMM d, yyyy')}
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
          </CardContent>
          <CardFooter>
            <Badge
              variant={
                projectTypeColors[project.client?.type as keyof typeof projectTypeColors] ||
                'secondary'
              }
            >
              {project.client?.type === 'creative' ? 'Content' : project.client?.type || 'N/A'}
            </Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
