import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, TrendingUp } from 'lucide-react';
import type { TeamMember } from '@/lib/api/users/types';

interface TeamCardsViewProps {
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

export function TeamCardsView({ teamMembers }: TeamCardsViewProps) {
  if (teamMembers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No team members found
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teamMembers.map((member) => (
        <Card key={member.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={member.image || undefined} alt={member.name} />
                <AvatarFallback>
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{member.name}</CardTitle>
                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={statusColors[member.status]}>{statusLabels[member.status]}</Badge>
              <span className="text-sm text-muted-foreground">
                {member.availableCapacity}% available
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-medium">{member.capacityPercentage}%</span>
              </div>
              <Progress value={member.capacityPercentage} />
            </div>

            <div className="pt-2 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {member.projectCount} {member.projectCount === 1 ? 'project' : 'projects'}
                </span>
              </div>

              {member.projects.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Active Projects</span>
                  </div>
                  <div className="space-y-1.5">
                    {member.projects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50"
                      >
                        <span className="truncate flex-1 mr-2">{project.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {project.completionPercentage}%
                        </span>
                      </div>
                    ))}
                    {member.projects.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{member.projects.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
