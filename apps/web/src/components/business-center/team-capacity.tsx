import { IconUsers } from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import type { TeamMember } from '@/lib/api/users/types';

/**
 * Team Capacity Props
 */
interface TeamCapacityProps {
  teamMembers: TeamMember[];
}

/**
 * Status configuration using global CSS variables
 */
const statusConfig = {
  available: {
    label: 'Available',
    color: 'text-success bg-success/10 border-success/20',
    dotColor: 'bg-success',
  },
  at_capacity: {
    label: 'At Capacity',
    color: 'text-warning bg-warning/10 border-warning/20',
    dotColor: 'bg-warning',
  },
  overloaded: {
    label: 'Overloaded',
    color: 'text-error bg-error/10 border-error/20',
    dotColor: 'bg-error',
  },
};

/**
 * Team Capacity Component (Server Component)
 * Displays team members with capacity allocation and availability status
 */
export function TeamCapacity({ teamMembers }: TeamCapacityProps) {
  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <IconUsers className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No team members</p>
        <p className="text-xs mt-1">Team capacity will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Members ({teamMembers.length})</h3>
      </div>

      {/* Team Capacity Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="text-center">Projects</TableHead>
              <TableHead className="text-center">Capacity Used</TableHead>
              <TableHead className="text-center">Available</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => {
              const config = statusConfig[member.status];

              return (
                <TableRow key={member.id} className="hover:bg-muted/50">
                  {/* Member Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.image || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Project Count */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono">
                      {member.projectCount}
                    </Badge>
                  </TableCell>

                  {/* Capacity Used with Progress Bar */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-center">
                        {member.capacityPercentage}%
                      </div>
                      <Progress
                        value={Math.min(member.capacityPercentage, 100)}
                        className="h-2 w-full"
                      />
                    </div>
                  </TableCell>

                  {/* Available Capacity */}
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">{member.availableCapacity}%</span>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                      <Badge variant="outline" className={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      Update Capacity
                    </Button>
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
