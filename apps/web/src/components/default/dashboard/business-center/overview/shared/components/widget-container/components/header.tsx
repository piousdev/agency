'use client';

/**
 * Widget Header Component
 * Container header with title, controls, and actions menu
 */

import {
  IconChevronDown,
  IconChevronUp,
  IconGripVertical,
  IconDotsVertical,
  IconRefresh,
  IconSettings,
  IconX,
} from '@tabler/icons-react';

import {
  WIDGET_ARIA_LABELS,
  WIDGET_MENU_LABELS,
  WIDGET_CLASSES,
  WIDGET_ICON_SIZES,
} from '@/components/default/dashboard/business-center/overview/shared/components/widget-container/constants';
import {
  isDraggable,
  isCollapsible,
  getCollapseAriaLabel,
  hasActions,
} from '@/components/default/dashboard/business-center/overview/shared/components/widget-container/utils';
import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';

import type {
  DragHandleProps,
  WidgetContainerCallbacks,
} from '@/components/default/dashboard/business-center/overview/shared/components/widget-container/type';
import type { ReactNode } from 'react';

type WidgetHeaderProps = Readonly<{
  titleId: string;
  title: string;
  icon?: ReactNode;
  collapsed?: boolean;
  editMode?: boolean;
  dragHandleProps?: DragHandleProps;
  onToggleCollapse?: () => void;
  callbacks: WidgetContainerCallbacks;
}>;

/**
 * Widget header with title, controls, and action menu
 * Handles drag, collapse, and dropdown menu functionality
 */
export function WidgetHeader({
  titleId,
  title,
  icon,
  collapsed,
  editMode,
  dragHandleProps,
  onToggleCollapse,
  callbacks,
}: WidgetHeaderProps) {
  const showDragHandle = isDraggable(editMode, dragHandleProps);
  const showCollapseButton = isCollapsible(onToggleCollapse);
  const showMenu = hasActions(callbacks);

  return (
    <CardHeader className={WIDGET_CLASSES.HEADER}>
      <Item className="flex flex-row justify-between items-center gap-1.5 min-w-0 w-full p-2">
        {/* Left side: Drag handle, collapse button, icon, and title */}
        <ItemContent className="flex flex-row items-center gap-1.5 min-w-0">
          {showDragHandle && dragHandleProps && (
            <ItemMedia>
              <DragHandle dragHandleProps={dragHandleProps} />
            </ItemMedia>
          )}

          {showCollapseButton && onToggleCollapse && (
            <ItemMedia>
              <CollapseButton collapsed={collapsed} onClick={onToggleCollapse} />
            </ItemMedia>
          )}

          {icon && (
            <ItemMedia>
              <span className="text-foreground shrink-0 [&_svg]:size-5" aria-hidden="true">
                {icon}
              </span>
            </ItemMedia>
          )}

          <ItemTitle id={titleId} className="text-base font-medium truncate">
            {title}
          </ItemTitle>
        </ItemContent>

        {/* Right side: Actions menu */}
        {showMenu && (
          <ItemContent className="flex items-center shrink-0">
            <ActionsMenu {...callbacks} editMode={editMode} />
          </ItemContent>
        )}
      </Item>
    </CardHeader>
  );
}

WidgetHeader.displayName = 'WidgetHeader';

/**
 * Drag handle for widget reordering
 */
function DragHandle({ dragHandleProps }: { dragHandleProps: DragHandleProps }) {
  return (
    <button
      {...dragHandleProps}
      className={WIDGET_CLASSES.DRAG_HANDLE}
      aria-label={WIDGET_ARIA_LABELS.DRAG_TO_REORDER}
    >
      <IconGripVertical className={WIDGET_ICON_SIZES.MD + ' text-muted-foreground'} />
    </button>
  );
}

/**
 * Collapse/expand toggle button
 */
function CollapseButton({ collapsed, onClick }: { collapsed?: boolean; onClick: () => void }) {
  const ariaLabel = getCollapseAriaLabel(
    collapsed,
    WIDGET_ARIA_LABELS.EXPAND_WIDGET,
    WIDGET_ARIA_LABELS.COLLAPSE_WIDGET
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      className={WIDGET_CLASSES.ICON_BUTTON}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={!collapsed}
    >
      {collapsed ? (
        <IconChevronDown className={WIDGET_ICON_SIZES.MD} />
      ) : (
        <IconChevronUp className={WIDGET_ICON_SIZES.MD} />
      )}
    </Button>
  );
}

/**
 * Actions dropdown menu
 */
function ActionsMenu({
  onRefresh,
  onConfigure,
  onRemove,
  editMode,
}: WidgetContainerCallbacks & { editMode?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={WIDGET_CLASSES.ICON_BUTTON}>
          <IconDotsVertical className={WIDGET_ICON_SIZES.MD} />
          <span className="sr-only">{WIDGET_ARIA_LABELS.WIDGET_OPTIONS}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {onRefresh && (
          <DropdownMenuItem onClick={onRefresh}>
            <IconRefresh className={WIDGET_ICON_SIZES.MD} />
            {WIDGET_MENU_LABELS.REFRESH}
          </DropdownMenuItem>
        )}

        {onConfigure && (
          <DropdownMenuItem onClick={onConfigure}>
            <IconSettings className={WIDGET_ICON_SIZES.MD} />
            {WIDGET_MENU_LABELS.CONFIGURE}
          </DropdownMenuItem>
        )}

        {editMode && onRemove && (
          <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
            <IconX className={WIDGET_ICON_SIZES.MD} />
            {WIDGET_MENU_LABELS.REMOVE}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
