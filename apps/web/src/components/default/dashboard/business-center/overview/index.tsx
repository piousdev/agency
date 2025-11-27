'use client';

import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

import { Header } from '@/components/default/dashboard/business-center/overview/components/header';
import { OverviewDataProvider } from '@/components/default/dashboard/business-center/overview/context/overview-data-context';
import {
  useDragReorder,
  useGreeting,
  useWidgetConfig,
  useLayoutInit,
} from '@/components/default/dashboard/business-center/overview/hooks';
import {
  SortableWidget,
  WidgetConfigDialog,
  WidgetContainer,
  WidgetGrid,
  WidgetContent,
  getWidgetTitle,
  getWidgetIcon,
  type WidgetType,
} from '@/components/default/dashboard/business-center/overview/shared';
import { useOverviewPrefetch } from '@/lib/hooks/use-prefetch';
import { useSocket } from '@/lib/hooks/use-socket';
import { useCollapsedWidgets, useDashboardStore, useEditMode } from '@/lib/stores/dashboard-store';
import { cn } from '@/lib/utils';

import type { OverviewData } from '@/lib/actions/business-center/overview';

interface OverviewDashboardProps {
  userId: string;
  userName?: string;
  userRole?: string;
  initialData?: OverviewData;
}

export function OverviewDashboard({
  userId: _userId,
  userName,
  userRole = 'developer',
  initialData,
}: OverviewDashboardProps) {
  // Initialize WebSocket connection for real-time alerts and activity
  useSocket();
  useOverviewPrefetch();

  const greeting = useGreeting();
  const editMode = useEditMode();
  const collapsedWidgets = useCollapsedWidgets();
  const { layout } = useLayoutInit({ userRole });
  const { reorderWidgets, toggleWidgetCollapse, removeWidget } = useDashboardStore();
  const { sensors, handleDragEnd } = useDragReorder(layout, reorderWidgets);
  const { isOpen, widget, openConfig, setIsOpen } = useWidgetConfig();

  // Context to provide overview data to widgets
  const visibleWidgets = layout.filter((w) => w.visible).sort((a, b) => a.position - b.position);

  return (
    <OverviewDataProvider value={initialData ?? null}>
      <div className="flex flex-col min-h-0 flex-1 animate-in fade-in duration-500 motion-reduce:animate-none">
        <Header greeting={greeting} userName={userName} userRole={userRole} />

        {editMode && (
          <div className="mb-4 p-3 bg-muted/50 border border-dashed rounded-lg text-sm text-muted-foreground">
            <strong>Edit Mode:</strong> Drag widgets to reorder. Click &quot;Done&quot; when finished.
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={visibleWidgets.map((w) => w.id)}
            strategy={rectSortingStrategy}
            disabled={!editMode}
          >
            <WidgetGrid
              className={cn(
                editMode && 'ring-2 ring-dashed ring-muted-foreground/20 rounded-lg p-2'
              )}
            >
              {visibleWidgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  id={widget.id}
                  size={widget.size}
                  disabled={!editMode}
                >
                  <WidgetContainer
                    title={getWidgetTitle(widget.type as WidgetType)}
                    icon={getWidgetIcon(widget.type as WidgetType)}
                    collapsed={collapsedWidgets.includes(widget.id)}
                    onToggleCollapse={() => toggleWidgetCollapse(widget.id)}
                    onRemove={() => removeWidget(widget.id)}
                    onConfigure={() => openConfig(widget.id, widget.type)}
                    editMode={editMode}
                  >
                    <WidgetContent type={widget.type} />
                  </WidgetContainer>
                </SortableWidget>
              ))}
            </WidgetGrid>
          </SortableContext>
        </DndContext>

        {widget && (
          <WidgetConfigDialog
            open={isOpen}
            onOpenChange={setIsOpen}
            widgetId={widget.id}
            widgetType={widget.type}
            widgetTitle={getWidgetTitle(widget.type as WidgetType)}
          />
        )}
      </div>
    </OverviewDataProvider>
  );
}
