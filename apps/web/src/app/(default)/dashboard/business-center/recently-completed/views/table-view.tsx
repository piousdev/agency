import { format } from 'date-fns';
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

interface CompletedTableViewProps {
  projects: ProjectWithRelations[];
}

const projectTypeColors = {
  creative: 'default',
  software: 'secondary',
} as const;

export function CompletedTableView({ projects }: CompletedTableViewProps) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No completed projects found
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Delivered</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{project.client?.name || 'N/A'}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    projectTypeColors[project.client?.type as keyof typeof projectTypeColors] ||
                    'secondary'
                  }
                >
                  {project.client?.type === 'creative' ? 'Content' : project.client?.type || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {project.assignees && project.assignees.length > 0 ? (
                    project.assignees.slice(0, 2).map((assignee) => (
                      <Badge key={assignee.id} variant="outline" className="text-xs">
                        {assignee.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No team</span>
                  )}
                  {project.assignees && project.assignees.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.assignees.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {project.createdAt ? format(new Date(project.createdAt), 'MMM d, yyyy') : 'N/A'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {project.deliveredAt
                  ? format(new Date(project.deliveredAt), 'MMM d, yyyy')
                  : format(new Date(project.updatedAt), 'MMM d, yyyy')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
