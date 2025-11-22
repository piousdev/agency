import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TeamMember } from '@/lib/api/users/types';

interface TeamTableViewProps {
  teamMembers: TeamMember[];
}

const statusColors = {
  available: 'default',
  at_capacity: 'secondary',
  overloaded: 'destructive',
} as const;

const statusLabels = {
  available: 'Available',
  at_capacity: 'At Capacity',
  overloaded: 'Overloaded',
} as const;

export function TeamTableView({ teamMembers }: TeamTableViewProps) {
  if (teamMembers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No team members found
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Member</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Projects</TableHead>
            <TableHead>Active Projects</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>
                <Badge variant={statusColors[member.status]}>{statusLabels[member.status]}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={member.capacityPercentage} className="w-24" />
                  <span className="text-sm text-muted-foreground">
                    {member.capacityPercentage}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{member.availableCapacity}%</TableCell>
              <TableCell className="text-muted-foreground">{member.projectCount}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {member.projects.length > 0 ? (
                    member.projects.slice(0, 2).map((project) => (
                      <Badge key={project.id} variant="outline" className="text-xs">
                        {project.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No active projects</span>
                  )}
                  {member.projects.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.projects.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
