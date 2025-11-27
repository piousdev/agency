'use client';

import * as React from 'react';

import { IconGripVertical, IconSettings } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SidebarSection {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

const DEFAULT_SECTIONS: SidebarSection[] = [
  { id: 'business-center', title: 'Business Center', visible: true, order: 0 },
  { id: 'client-service', title: 'Client & Service', visible: true, order: 1 },
  { id: 'collaboration', title: 'Collaboration', visible: true, order: 2 },
  { id: 'insights-admin', title: 'Insights & Admin', visible: true, order: 3 },
];

const STORAGE_KEY = 'skyll-sidebar-config';

export function useSidebarCustomization() {
  const [sections, setSections] = React.useState<SidebarSection[]>(DEFAULT_SECTIONS);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SidebarSection[];
        setSections(parsed);
      }
    } catch (error) {
      console.error('Failed to load sidebar configuration:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage
  const saveSections = React.useCallback((newSections: SidebarSection[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSections));
      setSections(newSections);
    } catch (error) {
      console.error('Failed to save sidebar configuration:', error);
    }
  }, []);

  const toggleVisibility = React.useCallback(
    (id: string) => {
      const updated = sections.map((section) =>
        section.id === id ? { ...section, visible: !section.visible } : section
      );
      saveSections(updated);
    },
    [sections, saveSections]
  );

  const reorderSections = React.useCallback(
    (fromIndex: number, toIndex: number) => {
      const updated = [...sections];
      const [removed] = updated.splice(fromIndex, 1);
      if (removed) {
        updated.splice(toIndex, 0, removed);
        const reordered = updated.map((section, index) => ({ ...section, order: index }));
        saveSections(reordered);
      }
    },
    [sections, saveSections]
  );

  const resetToDefault = React.useCallback(() => {
    saveSections(DEFAULT_SECTIONS);
  }, [saveSections]);

  return {
    sections,
    isLoading,
    toggleVisibility,
    reorderSections,
    resetToDefault,
  };
}

export function SidebarCustomizationDialog() {
  const { sections, toggleVisibility, reorderSections, resetToDefault } = useSidebarCustomization();
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      reorderSections(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Customize sidebar">
          <IconSettings className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customize Sidebar</DialogTitle>
          <DialogDescription>
            Reorder sections or hide the ones you don&apos;t use. Drag to reorder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <button
                key={section.id}
                type="button"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border bg-card p-3 text-left transition-colors',
                  draggedIndex === index && 'opacity-50',
                  dragOverIndex === index && 'border-primary',
                  'cursor-move hover:bg-accent'
                )}
              >
                <div className="flex items-center gap-3">
                  <IconGripVertical className="size-4 text-muted-foreground" />
                  <Label htmlFor={`section-${section.id}`} className="cursor-move">
                    {section.title}
                  </Label>
                </div>
                <Switch
                  id={`section-${section.id}`}
                  checked={section.visible}
                  onCheckedChange={() => toggleVisibility(section.id)}
                />
              </button>
            ))}
        </div>

        <div className="flex justify-between border-t pt-4">
          <Button variant="outline" size="sm" onClick={resetToDefault}>
            Reset to default
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
