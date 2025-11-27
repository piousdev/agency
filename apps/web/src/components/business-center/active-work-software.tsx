import { IconCalendar, IconCode, IconUsers } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { AssignTrigger } from './assign-trigger';

import type { ProjectWithRelations } from '@/lib/api/projects/types';
import type { TeamMember } from '@/lib/api/users/types';

/**
 * Active Work - Software Props
 */
interface ActiveWorkSoftwareProps {
  projects: ProjectWithRelations[];
  teamMembers: TeamMember[];
}

/**
 * Group projects by software development stage based on status and completion
 */
function groupByStage(projects: ProjectWithRelations[]) {
  const stages = {
    Design: [] as ProjectWithRelations[],
    Development: [] as ProjectWithRelations[],
    Testing: [] as ProjectWithRelations[],
    Delivery: [] as ProjectWithRelations[],
  };

  projects.forEach((project) => {
    // Design: proposal or very early development (< 20%)
    if (
      project.status === 'proposal' ||
      (project.status === 'in_development' && project.completionPercentage < 20)
    ) {
      stages.Design.push(project);
    }
    // Testing: in review or near completion (70-94%)
    else if (
      project.status === 'in_review' ||
      (project.status === 'in_development' &&
        project.completionPercentage >= 70 &&
        project.completionPercentage < 95)
    ) {
      stages.Testing.push(project);
    }
    // Delivery: >= 95% completion
    else if (project.completionPercentage >= 95) {
      stages.Delivery.push(project);
    }
    // Development: active coding (20-69%)
    else {
      stages.Development.push(project);
    }
  });

  return stages;
}

/**
 * Active Work - Software Component (Server Component)
 * Displays software development projects grouped by development stage
 */
export function ActiveWorkSoftware({ projects, teamMembers }: ActiveWorkSoftwareProps) {
  // Filter only software/full-service projects
  const softwareProjects = projects.filter(
    (p) =>
      ['software', 'full_service'].includes(p.client.type) &&
      ['in_development', 'in_review'].includes(p.status)
  );

  const projectsByStage = groupByStage(softwareProjects);

  if (softwareProjects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <IconCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No active software projects</p>
        <p className="text-xs mt-1">Projects will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(Object.keys(projectsByStage) as (keyof typeof projectsByStage)[]).map((stage) => {
        const stageProjects = projectsByStage[stage];

        if (stageProjects.length === 0) return null;

        return (
          <div key={stage} className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-muted-foreground">{stage}</h4>
              <Badge variant="outline" className="text-xs">
                {stageProjects.length}
              </Badge>
            </div>

            <div className="grid gap-3">
              {stageProjects.map((project) => (
                <Card key={project.id} className="hover:bg-muted/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-1">{project.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{project.client.name}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Assignees */}
                    {project.assignees.length > 0 && (
                      <div className="flex items-center gap-2">
                        <IconUsers className="h-3 w-3 text-muted-foreground" />
                        <div className="flex items-center gap-1">
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
                            <span className="text-xs text-muted-foreground ml-1">
                              +{project.assignees.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Completion Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.completionPercentage}%</span>
                      </div>
                      <Progress value={project.completionPercentage} className="h-2" />
                    </div>

                    {/* Deadline (if available) */}
                    {project.deliveredAt && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <IconCalendar className="h-3 w-3" />
                        <span>
                          Due{' '}
                          {new Date(project.deliveredAt).toLocaleDateString('en-BE', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <AssignTrigger
                        entityType="project"
                        entityId={project.id}
                        entityName={project.name}
                        currentAssignees={project.assignees.map((a) => a.id)}
                        teamMembers={teamMembers}
                        buttonText="Change Assignee"
                        buttonVariant="outline"
                        buttonSize="sm"
                        buttonClassName="text-xs h-7"
                      />
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        Update Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
