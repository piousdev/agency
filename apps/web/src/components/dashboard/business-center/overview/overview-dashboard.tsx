'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  IconCheck,
  IconLayout,
  IconPencil,
  IconPlus,
  IconRotate,
  IconSettings,
} from '@tabler/icons-react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SortableWidget } from '@/components/dashboard/business-center/overview/shared/sortable-widget';
import { WidgetConfigDialog } from '@/components/dashboard/business-center/overview/shared/widget-config-dialog';
import { WidgetContainer } from '@/components/dashboard/business-center/overview/shared/widget-container';
import { WidgetGrid } from '@/components/dashboard/business-center/overview/shared/widget-grid';
import { LazyWidgetContent } from '@/components/dashboard/business-center/overview/widgets';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { OverviewData } from '@/lib/actions/business-center/overview';
import { useOverviewPrefetch } from '@/lib/hooks/use-prefetch';
import {
  useCollapsedWidgets,
  useDashboardStore,
  useEditMode,
  useLayout,
} from '@/lib/stores/dashboard-store';
import { cn } from '@/lib/utils';

// Context to provide overview data to widgets
const OverviewDataContext = createContext<OverviewData | null>(null);

export function useOverviewData() {
  return useContext(OverviewDataContext);
}

interface OverviewDashboardProps {
  userId: string;
  userName?: string;
  userRole?: string;
  initialData?: OverviewData;
}

/**
 * Overview Dashboard Component
 *
 * Handles the interactive dashboard with drag-and-drop widget reordering.
 * Uses Zustand for state management with localStorage persistence.
 */
export function OverviewDashboard({
  userId,
  userName,
  userRole = 'developer',
  initialData,
}: OverviewDashboardProps) {
  const layout = useLayout();
  const editMode = useEditMode();
  const collapsedWidgets = useCollapsedWidgets();

  // Prefetch common navigation routes for faster perceived navigation
  useOverviewPrefetch();
  const {
    reorderWidgets,
    toggleEditMode,
    toggleWidgetCollapse,
    toggleWidgetVisibility,
    removeWidget,
    resetToDefault,
    getDefaultLayoutForRole,
    setLayout,
  } = useDashboardStore();

  // Initialize layout from role defaults if empty
  useEffect(() => {
    if (layout.length === 0) {
      const defaultLayout = getDefaultLayoutForRole(userRole);
      setLayout(defaultLayout);
    }
  }, [layout.length, userRole, getDefaultLayoutForRole, setLayout]);

  // Setup drag sensors with keyboard accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end - reorder widgets
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = layout.findIndex((w) => w.id === active.id);
        const newIndex = layout.findIndex((w) => w.id === over.id);
        reorderWidgets(oldIndex, newIndex);
      }
    },
    [layout, reorderWidgets]
  );

  // Get visible widgets sorted by position
  const visibleWidgets = layout.filter((w) => w.visible).sort((a, b) => a.position - b.position);

  // Get hidden widgets for the "Add Widget" panel
  const hiddenWidgets = layout.filter((w) => !w.visible);

  // Get greeting based on time of day - only after hydration to avoid mismatch
  const [greeting, setGreeting] = useState('Welcome');

  // State for widget configuration dialog
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configuringWidget, setConfiguringWidget] = useState<{
    id: string;
    type: string;
  } | null>(null);

  const handleConfigureWidget = useCallback((widgetId: string, widgetType: string) => {
    setConfiguringWidget({ id: widgetId, type: widgetType });
    setConfigDialogOpen(true);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <OverviewDataContext.Provider value={initialData || null}>
      <div className="flex flex-col min-h-0 flex-1 animate-in fade-in duration-500 motion-reduce:animate-none">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting}
              {userName ? `, ${userName.split(' ')[0]}` : ''}
            </h1>
            <p className="text-muted-foreground">Here&apos;s your overview for today</p>
          </div>

          <div className="flex items-center gap-2">
            {editMode && (
              <>
                {/* Add Widget Panel */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={hiddenWidgets.length === 0}
                    >
                      <IconPlus className="h-4 w-4" />
                      Add Widget
                      {hiddenWidgets.length > 0 && (
                        <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                          {hiddenWidgets.length}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 p-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium px-2 py-1">Available Widgets</p>
                      {hiddenWidgets.length === 0 ? (
                        <p className="text-xs text-muted-foreground px-2 py-2">
                          All widgets are currently visible
                        </p>
                      ) : (
                        hiddenWidgets.map((widget) => (
                          <Button
                            key={widget.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm"
                            onClick={() => toggleWidgetVisibility(widget.id)}
                          >
                            <IconPlus className="h-4 w-4 mr-2" />
                            {getWidgetTitle(widget.type)}
                          </Button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <IconLayout className="h-4 w-4" />
                      Layout Presets
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Apply Preset</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => resetToDefault('admin')}>
                      Admin Layout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resetToDefault('pm')}>
                      Project Manager Layout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resetToDefault('developer')}>
                      Developer Layout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resetToDefault('designer')}>
                      Designer Layout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resetToDefault('qa')}>
                      QA Layout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resetToDefault('client')}>
                      Client Layout
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => resetToDefault(userRole)}>
                      <IconRotate className="h-4 w-4 mr-2" />
                      Reset to My Default
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <Button
              variant={editMode ? 'default' : 'outline'}
              size="sm"
              onClick={toggleEditMode}
              className="gap-2"
            >
              {editMode ? (
                <>
                  <IconCheck className="h-4 w-4" />
                  Done
                </>
              ) : (
                <>
                  <IconPencil className="h-4 w-4" />
                  Customize
                </>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <IconSettings className="h-4 w-4" />
              <span className="sr-only">Dashboard Settings</span>
            </Button>
          </div>
        </div>

        {/* Edit Mode Banner */}
        {editMode && (
          <div className="mb-4 p-3 bg-muted/50 border border-dashed rounded-lg text-sm text-muted-foreground">
            <strong>Edit Mode:</strong> Drag widgets to reorder. Use the menu on each widget to
            remove or configure. Click &quot;Done&quot; when finished.
          </div>
        )}

        {/* Widget Grid with Drag and Drop */}
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
                    title={getWidgetTitle(widget.type)}
                    icon={getWidgetIcon(widget.type)}
                    collapsed={collapsedWidgets.includes(widget.id)}
                    onToggleCollapse={() => toggleWidgetCollapse(widget.id)}
                    onRemove={() => removeWidget(widget.id)}
                    onConfigure={() => handleConfigureWidget(widget.id, widget.type)}
                    editMode={editMode}
                  >
                    <WidgetContent type={widget.type} />
                  </WidgetContainer>
                </SortableWidget>
              ))}
            </WidgetGrid>
          </SortableContext>
        </DndContext>

        {/* Widget Configuration Dialog */}
        {configuringWidget && (
          <WidgetConfigDialog
            open={configDialogOpen}
            onOpenChange={setConfigDialogOpen}
            widgetId={configuringWidget.id}
            widgetType={configuringWidget.type}
            widgetTitle={getWidgetTitle(configuringWidget.type)}
          />
        )}
      </div>
    </OverviewDataContext.Provider>
  );
}

/**
 * Render appropriate content based on widget type
 * Uses lazy loading with Suspense for code splitting and parallel loading
 */
function WidgetContent({ type }: { type: string }) {
  return <LazyWidgetContent type={type} />;
}

/**
 * Placeholder component for widgets not yet implemented
 */
function WidgetPlaceholder({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
      <p className="text-sm">{getWidgetTitle(type)}</p>
      <p className="text-xs">Widget coming soon</p>
    </div>
  );
}

/**
 * Get human-readable widget title
 */
function getWidgetTitle(type: string): string {
  const titles: Record<string, string> = {
    'quick-actions': 'Quick Actions',
    'organization-health': 'Organization Health',
    'critical-alerts': 'Critical Alerts',
    'team-status': 'Team Status',
    'intake-pipeline': 'Intake Pipeline',
    'upcoming-deadlines': 'Upcoming Deadlines',
    'recent-activity': 'Recent Activity',
    'financial-snapshot': 'Financial Snapshot',
    'my-work-today': 'My Work Today',
    'current-sprint': 'Current Sprint',
    'risk-indicators': 'Risk Indicators',
    blockers: 'Blockers',
  };
  return titles[type] || type;
}

/**
 * Get widget icon - placeholder for now
 */
function getWidgetIcon(_type: string): React.ReactNode {
  return null;
}
