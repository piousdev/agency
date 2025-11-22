/**
 * Assign Role Form Component
 * Client component for assigning new roles to a user
 * Uses Server Action with useActionState
 */

'use client';

import { AlertCircle, CheckCircle2, Loader2, Plus, Shield } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type ActionState, assignRoleAction } from '../../actions';

interface Role {
  id: string;
  name: string;
  description: string | null;
  roleType: string;
  permissions: Record<string, boolean> | null;
}

interface AssignRoleFormProps {
  userId: string;
  availableRoles: Role[];
}

const initialState: ActionState = {
  success: undefined,
  message: undefined,
  errors: {},
};

export function AssignRoleForm({ userId, availableRoles }: AssignRoleFormProps) {
  const [state, formAction, isPending] = useActionState(
    assignRoleAction.bind(null, userId),
    initialState
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Find the selected role details
  const selectedRole = availableRoles.find((r) => r.id === selectedRoleId);

  // Handle success - show toast and reset form
  useEffect(() => {
    if (state.success) {
      toast.success(state.message || 'Role assigned successfully!');
      setSelectedRoleId('');
    }
  }, [state.success, state.message]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign New Role</CardTitle>
        <CardDescription>Select a role to grant additional permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Role selector */}
          <div className="space-y-2">
            <Label htmlFor="roleId">
              Select Role <span className="text-destructive">*</span>
            </Label>
            <Select
              name="roleId"
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={isPending}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a role to assign" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>{role.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.roleId && (
              <p className="text-sm text-destructive">{state.errors.roleId[0]}</p>
            )}
          </div>

          {/* Role details preview */}
          {selectedRole && (
            <div className="rounded-lg border p-4 space-y-3 bg-secondary/50">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{selectedRole.name}</h3>
                    <Badge variant="outline">{selectedRole.roleType}</Badge>
                  </div>
                  {selectedRole.description && (
                    <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                  )}
                </div>
              </div>

              {selectedRole.permissions && Object.keys(selectedRole.permissions).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    This role grants the following permissions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(selectedRole.permissions)
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
          )}

          {/* Error message */}
          {state.message && !state.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {state.success && (
            <Alert className="border-success bg-success/10 text-success">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {/* Submit button */}
          <Button type="submit" disabled={isPending || !selectedRoleId} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning Role...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Assign Role
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
