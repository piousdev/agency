'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { IconPlus, IconDotsVertical, IconEdit, IconTrash, IconTag } from '@tabler/icons-react';

import { LabelForm } from '@/components/business-center/forms';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  createLabelAction,
  updateLabelAction,
  deleteLabelAction,
} from '@/lib/actions/business-center/labels';

import type { Label } from '@/lib/api/labels';


interface LabelsClientProps {
  initialLabels: Label[];
}

export function LabelsClient({ initialLabels }: LabelsClientProps) {
  const router = useRouter();
  const labels = initialLabels;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    router.refresh();
  };

  const handleEditSuccess = () => {
    setEditingLabel(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingLabel) return;

    setIsDeleting(true);
    try {
      const result = await deleteLabelAction(deletingLabel.id);
      if (result.success) {
        setDeletingLabel(null);
        router.refresh();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateLabel = async (formData: FormData) => {
    if (!editingLabel) return { success: false, error: 'No label selected' };
    return updateLabelAction(editingLabel.id, formData);
  };

  /**
   * Determine if a color is light (for text contrast)
   */
  const isLightColor = (hexColor: string): boolean => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  // Group labels by scope
  const globalLabels = labels.filter((l) => l.scope === 'global');
  const projectLabels = labels.filter((l) => l.scope === 'project');
  const ticketLabels = labels.filter((l) => l.scope === 'ticket');

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Create Label
        </Button>
      </div>

      {/* Labels by scope */}
      <div className="grid gap-6">
        <LabelSection
          title="Global Labels"
          description="Can be used on both tickets and projects"
          labels={globalLabels}
          isLightColor={isLightColor}
          onEdit={setEditingLabel}
          onDelete={setDeletingLabel}
        />
        <LabelSection
          title="Project Labels"
          description="Specific to projects"
          labels={projectLabels}
          isLightColor={isLightColor}
          onEdit={setEditingLabel}
          onDelete={setDeletingLabel}
        />
        <LabelSection
          title="Ticket Labels"
          description="Specific to tickets"
          labels={ticketLabels}
          isLightColor={isLightColor}
          onEdit={setEditingLabel}
          onDelete={setDeletingLabel}
        />
      </div>

      {/* Empty state */}
      {labels.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconTag className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No labels yet</h3>
            <p className="text-muted-foreground text-center mt-1 mb-4">
              Create labels to help organize your tickets and projects
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Create Your First Label
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Label</DialogTitle>
            <DialogDescription>Add a new label to organize your work</DialogDescription>
          </DialogHeader>
          <LabelForm
            mode="create"
            onSubmit={createLabelAction}
            onSuccess={handleCreateSuccess}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingLabel} onOpenChange={(open) => !open && setEditingLabel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
            <DialogDescription>Update the label details</DialogDescription>
          </DialogHeader>
          {editingLabel && (
            <LabelForm
              label={editingLabel}
              mode="edit"
              onSubmit={handleUpdateLabel}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingLabel(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingLabel} onOpenChange={(open) => !open && setDeletingLabel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Label</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingLabel?.name}&quot;? This will remove
              the label from all tickets and projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface LabelSectionProps {
  title: string;
  description: string;
  labels: Label[];
  isLightColor: (color: string) => boolean;
  onEdit: (label: Label) => void;
  onDelete: (label: Label) => void;
}

function LabelSection({
  title,
  description,
  labels,
  isLightColor,
  onEdit,
  onDelete,
}: LabelSectionProps) {
  if (labels.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {labels.map((label) => (
            <div
              key={label.id}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card hover:shadow-sm transition-shadow"
            >
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: label.color,
                  color: isLightColor(label.color) ? '#000' : '#fff',
                }}
              >
                {label.name}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IconDotsVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(label)}>
                    <IconEdit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(label)}
                    className="text-destructive focus:text-destructive"
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
