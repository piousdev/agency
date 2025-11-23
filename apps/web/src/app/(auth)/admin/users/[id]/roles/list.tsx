/**
 * Current Roles List Component
 * Client component displaying user's current roles with remove functionality
 */

'use client';

import { format } from 'date-fns';
import { IconCalendar, IconShield, IconUser, IconX } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { removeRoleAction } from '../../actions';

interface Role {
  id: string;
  name: string;
  description: string | null;
  roleType: string;
  permissions: Record<string, boolean> | null;
  assignedAt?: Date;
  assignedBy?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface CurrentRolesListProps {
  userId: string;
  roles: Role[];
}

export function CurrentRolesList({ userId, roles }: CurrentRolesListProps) {
  const [isPending, startTransition] = useTransition();
  const [roleToRemove, setRoleToRemove] = useState<Role | null>(null);

  const handleRemoveRole = async () => {
    if (!roleToRemove) return;

    startTransition(async () => {
      try {
        const result = await removeRoleAction(userId, roleToRemove.id);

        if (result.success) {
          toast.success(result.message || 'Role removed successfully');
          setRoleToRemove(null);
        } else {
          toast.error(result.message || 'Failed to remove role');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to remove role');
      }
    });
  };

  if (roles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Roles</CardTitle>
          <CardDescription>This user has no roles assigned yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Assign roles below to grant this user specific permissions and access levels.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Current Roles ({roles.length})</CardTitle>
          <CardDescription>Roles currently assigned to this user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <IconShield className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{role.name}</h3>
                    <Badge variant="outline" className="ml-2">
                      {role.roleType}
                    </Badge>
                  </div>

                  {role.description && (
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  )}

                  {(role.assignedAt || role.assignedBy) && (
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {role.assignedAt && (
                        <div className="flex items-center gap-1">
                          <IconCalendar className="h-3 w-3" />
                          <span>Assigned {format(new Date(role.assignedAt), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                      {role.assignedBy && (
                        <div className="flex items-center gap-1">
                          <IconUser className="h-3 w-3" />
                          <span>by {role.assignedBy.name || role.assignedBy.email}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {role.permissions && Object.keys(role.permissions).length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(role.permissions)
                          .filter(([, value]) => value)
                          .map(([key]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRoleToRemove(role)}
                  disabled={isPending}
                  className="ml-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <IconX className="h-4 w-4" />
                  <span className="sr-only">Remove role</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remove role confirmation dialog */}
      <AlertDialog open={!!roleToRemove} onOpenChange={(open) => !open && setRoleToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the role &quot;
              {roleToRemove?.name}
              &quot;? This will immediately revoke all permissions associated with this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveRole}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Removing...' : 'Remove Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
