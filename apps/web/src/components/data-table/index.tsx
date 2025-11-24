'use client';

import { useRef, useCallback, useMemo, useId, useState, useEffect } from 'react';
import {
  flexRender,
  type ColumnDef,
  type Row,
  type Header,
  type Table as TanStackTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DragStart,
  type DraggableProvided,
  type DroppableProvided,
  type DraggableStateSnapshot,
  type DroppableStateSnapshot,
} from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IconGripVertical, IconLoader2 } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { DataTableColumnHeader, getColumnPinningStyles } from './column-header';
import { DataTableToolbar, DataTableBulkActions } from './toolbar';
import { DataTablePagination, DataTableLoadMore } from './pagination';
import type { DataTableProps, DataTableConfig } from './types';

/**
 * DataTable - Enterprise-grade data table component
 *
 * Features:
 * - Sorting, filtering, pagination
 * - Column visibility, ordering, pinning, resizing
 * - Row selection (single/multi)
 * - Virtual scrolling for large datasets
 * - Drag-and-drop column AND row reordering
 * - Full keyboard navigation
 * - WCAG 2.1 compliant
 */
export function DataTable<TData>({
  columns: userColumns,
  data,
  config = {},
  initialSorting,
  initialColumnFilters,
  initialColumnVisibility,
  initialColumnOrder,
  initialColumnPinning,
  initialRowSelection,
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
  onRowSelectionChange,
  onRowClick,
  onRowDoubleClick,
  onRowOrderChange,
  pagination,
  onLoadMore,
  isLoading = false,
  emptyMessage = 'No results found.',
  renderRowActions,
  renderBulkActions,
  toolbarContent,
  toolbarRightContent,
  tableId,
  tableCaption,
  className,
  getRowId,
}: DataTableProps<TData>) {
  const defaultConfig: DataTableConfig = {
    enableRowSelection: false,
    enableColumnVisibility: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableSorting: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableVirtualization: false,
    enableRowOrdering: false,
    estimatedRowHeight: 52,
    virtualOverscan: 10,
    virtualTableHeight: 600,
    enableKeyboardNavigation: true,
    ...config,
  };

  const generatedId = useId();
  const resolvedTableId = tableId || `data-table-${generatedId}`;
  const [dragMode, setDragMode] = useState<'column' | 'row' | null>(null);
  // Track column drag state for visual feedback
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(null);
  const [isDropAtEnd, setIsDropAtEnd] = useState(false);
  // Track row drag state for visual feedback
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [dropTargetRowIndex, setDropTargetRowIndex] = useState<number | null>(null);
  const [isRowDropAtEnd, setIsRowDropAtEnd] = useState(false);

  // Track if component has mounted to avoid hydration issues with DnD
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add selection column if enabled
  const columnsWithDragHandle = useMemo<ColumnDef<TData, unknown>[]>(() => {
    const cols: ColumnDef<TData, unknown>[] = [];

    // Add row drag handle column if row ordering is enabled
    if (defaultConfig.enableRowOrdering) {
      const dragHandleColumn: ColumnDef<TData, unknown> = {
        id: 'drag-handle',
        size: 40,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
        enablePinning: false,
        enableResizing: false,
        header: () => null,
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            data-row-drag-handle={row.id}
          >
            <IconGripVertical className="h-4 w-4" />
          </div>
        ),
        meta: {
          canReorder: false,
        },
      };
      cols.push(dragHandleColumn);
    }

    // Add selection column if enabled
    if (defaultConfig.enableRowSelection) {
      const selectionColumn: ColumnDef<TData, unknown> = {
        id: 'select',
        size: 40,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
        enableGlobalFilter: false,
        enablePinning: false,
        enableResizing: false,
        header: ({ table }) =>
          defaultConfig.enableRowSelection === 'multi' ||
          defaultConfig.enableRowSelection === true ? (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all rows"
            />
          ) : null,
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select row ${row.index + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        meta: {
          canReorder: false,
        },
      };
      cols.push(selectionColumn);
    }

    return [...cols, ...userColumns];
  }, [userColumns, defaultConfig.enableRowSelection, defaultConfig.enableRowOrdering]);

  // Initialize table state
  const {
    table,
    globalFilter,
    setGlobalFilter,
    columnOrder,
    setColumnOrder,
    resetAllState,
    setSorting,
  } = useDataTable({
    data,
    columns: columnsWithDragHandle,
    config: defaultConfig,
    initialSorting,
    initialColumnFilters,
    initialColumnVisibility,
    initialColumnOrder,
    initialColumnPinning,
    initialRowSelection,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onRowSelectionChange,
    getRowId,
  });

  const { rows } = table.getRowModel();

  // Virtualization
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => defaultConfig.estimatedRowHeight!,
    overscan: defaultConfig.virtualOverscan,
    enabled: defaultConfig.enableVirtualization,
  });

  // Unified drag-and-drop handler
  const handleDragStart = useCallback((start: DragStart) => {
    if (start.type === 'COLUMN') {
      setDragMode('column');
      setDraggedColumnId(start.draggableId.replace('col-', ''));
    } else if (start.type === 'ROW') {
      setDragMode('row');
      setDraggedRowId(start.draggableId);
    }
  }, []);

  // Track drag position for visual feedback
  const handleDragUpdate = useCallback(
    (update: {
      destination: { index: number } | null;
      source: { index: number };
      type: string;
    }) => {
      if (update.type === 'COLUMN' && update.destination) {
        setDragOverColumnIndex(update.destination.index);
        // Get the column ID at the destination index for highlighting the entire column
        // Use getHeaderGroups to get headers in the same order as they're rendered
        const headerGroups = table.getHeaderGroups();
        const headers = headerGroups[0]?.headers || [];
        const sourceIndex = update.source.index;
        const destIndex = update.destination.index;
        const lastValidIndex = headers.length - 1;

        // Determine if we're moving to the end of the list
        // When dragging forward (left to right) and the destination is the last index,
        // we want to show the indicator on the right side
        const isDraggingForward = sourceIndex < destIndex;
        const dropAtEnd =
          destIndex >= headers.length || (isDraggingForward && destIndex === lastValidIndex);
        setIsDropAtEnd(dropAtEnd);

        const targetHeader = headers[Math.min(destIndex, lastValidIndex)];
        setDropTargetColumnId(targetHeader?.id || null);
      } else if (update.type === 'ROW' && update.destination) {
        const sourceIndex = update.source.index;
        const destIndex = update.destination.index;
        const lastValidIndex = rows.length - 1;

        // Determine if we're moving to the end of the list
        const isDraggingDown = sourceIndex < destIndex;
        const dropAtEnd =
          destIndex >= rows.length || (isDraggingDown && destIndex === lastValidIndex);
        setIsRowDropAtEnd(dropAtEnd);
        setDropTargetRowIndex(destIndex);
      } else {
        setDragOverColumnIndex(null);
        setDropTargetColumnId(null);
        setIsDropAtEnd(false);
        setDropTargetRowIndex(null);
        setIsRowDropAtEnd(false);
      }
    },
    [table, rows]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      setDragMode(null);
      setDraggedColumnId(null);
      setDragOverColumnIndex(null);
      setDropTargetColumnId(null);
      setIsDropAtEnd(false);
      setDraggedRowId(null);
      setDropTargetRowIndex(null);
      setIsRowDropAtEnd(false);

      if (!result.destination) return;
      if (result.source.index === result.destination.index) return;

      if (result.type === 'COLUMN') {
        // Column reordering - extract the column ID from draggableId (format: "col-{id}")
        const draggedColumnId = result.draggableId.replace('col-', '');

        // Skip special columns that shouldn't be reordered
        if (draggedColumnId === 'select' || draggedColumnId === 'drag-handle') {
          return;
        }

        // Get the visible headers to map indices correctly
        const headerGroups = table.getHeaderGroups();
        const visibleHeaders = headerGroups[0]?.headers.map((h) => h.id) || [];
        const sourceIndex = result.source.index;
        const destIndex = result.destination.index;

        // Determine if we're moving to the end of the list
        // When dragging forward (left to right) and the destination is the last index,
        // we want to place the item AFTER the last item (at the end)
        const lastValidIndex = visibleHeaders.length - 1;
        const isDraggingForward = sourceIndex < destIndex;
        const isDropAtEnd =
          destIndex >= visibleHeaders.length || (isDraggingForward && destIndex === lastValidIndex);

        // Get the column ID at the destination position
        const destHeaderId = visibleHeaders[Math.min(destIndex, lastValidIndex)];

        // Don't allow dropping on special columns or invalid index
        if (!destHeaderId || destHeaderId === 'select' || destHeaderId === 'drag-handle') {
          return;
        }

        // Find source index in the columnOrder array
        const sourceOrderIndex = columnOrder.indexOf(draggedColumnId);
        if (sourceOrderIndex === -1) return;

        // Reorder the array
        const newOrder = [...columnOrder];
        const [removed] = newOrder.splice(sourceOrderIndex, 1);
        if (removed) {
          if (isDropAtEnd) {
            // If dropping at the end, push to the end of the array
            newOrder.push(removed);
          } else {
            // Find destination index in the columnOrder array
            const destOrderIndex = newOrder.indexOf(destHeaderId);
            if (destOrderIndex === -1) return;
            // Insert at the destination position
            newOrder.splice(destOrderIndex, 0, removed);
          }
          setColumnOrder(newOrder);
        }
      } else if (result.type === 'ROW') {
        // Row reordering - compute the new order of all row IDs and pass to parent
        if (onRowOrderChange) {
          const sourceIndex = result.source.index;
          const destinationIndex = result.destination.index;

          // Get current row IDs in their visible order
          const currentIds = rows.map((row) => row.id);

          // Perform the reorder on the ID array
          const newIds = [...currentIds];
          const [movedId] = newIds.splice(sourceIndex, 1);
          if (movedId !== undefined) {
            newIds.splice(destinationIndex, 0, movedId);

            // Clear sorting when manually reordering rows
            // This prevents the table from re-sorting and overriding the manual order
            setSorting([]);

            onRowOrderChange(newIds);
          }
        }
      }
    },
    [columnOrder, setColumnOrder, onRowOrderChange, setSorting, table, rows]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, row: Row<TData>, cellIndex: number) => {
      if (!defaultConfig.enableKeyboardNavigation) return;

      const currentRowIndex = rows.indexOf(row);
      const visibleCells = row.getVisibleCells();

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentRowIndex > 0) {
            const targetRow = document.querySelector(
              `[data-row-index="${currentRowIndex - 1}"] [data-cell-index="${cellIndex}"]`
            ) as HTMLElement;
            targetRow?.focus();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentRowIndex < rows.length - 1) {
            const targetRow = document.querySelector(
              `[data-row-index="${currentRowIndex + 1}"] [data-cell-index="${cellIndex}"]`
            ) as HTMLElement;
            targetRow?.focus();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (cellIndex > 0) {
            const targetCell = document.querySelector(
              `[data-row-index="${currentRowIndex}"] [data-cell-index="${cellIndex - 1}"]`
            ) as HTMLElement;
            targetCell?.focus();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (cellIndex < visibleCells.length - 1) {
            const targetCell = document.querySelector(
              `[data-row-index="${currentRowIndex}"] [data-cell-index="${cellIndex + 1}"]`
            ) as HTMLElement;
            targetCell?.focus();
          }
          break;
        case 'Enter':
        case ' ':
          if (e.target === e.currentTarget) {
            e.preventDefault();
            onRowClick?.(row);
          }
          break;
      }
    },
    [rows, defaultConfig.enableKeyboardNavigation, onRowClick]
  );

  // Render header cell with drag handle
  const renderHeaderCell = (
    header: Header<TData, unknown>,
    dragHandleProps?: DraggableProvided['dragHandleProps']
  ) => {
    const column = header.column;
    const meta = column.columnDef.meta;
    const canReorder =
      defaultConfig.enableColumnOrdering &&
      meta?.canReorder !== false &&
      header.id !== 'select' &&
      header.id !== 'drag-handle';

    if (header.isPlaceholder) {
      return null;
    }

    // Check if header has a custom render function
    const headerDef = column.columnDef.header;
    if (typeof headerDef === 'function') {
      // If it returns something other than a string, render it directly
      const rendered = flexRender(headerDef, header.getContext());
      if (typeof rendered !== 'string') {
        return rendered;
      }
      // Otherwise use our DataTableColumnHeader with the string
      return (
        <DataTableColumnHeader
          column={column}
          title={rendered}
          enableSorting={defaultConfig.enableSorting}
          enableHiding={defaultConfig.enableColumnVisibility}
          enablePinning={defaultConfig.enableColumnPinning}
          dragHandleProps={canReorder ? dragHandleProps : undefined}
        />
      );
    }

    return (
      <DataTableColumnHeader
        column={column}
        title={headerDef as string}
        enableSorting={defaultConfig.enableSorting}
        enableHiding={defaultConfig.enableColumnVisibility}
        enablePinning={defaultConfig.enableColumnPinning}
        dragHandleProps={canReorder ? dragHandleProps : undefined}
      />
    );
  };

  // Render individual row content (used for both normal and dragging states)
  const renderRowContent = (
    row: Row<TData>,
    index: number,
    isDragging = false,
    dragHandleProps?: DraggableProvided['dragHandleProps'],
    isRowDropTarget = false,
    rowDropAtEnd = false
  ) => {
    return row.getVisibleCells().map((cell, cellIndex) => {
      const isDragHandleCell = cell.column.id === 'drag-handle';
      // Check if this cell's column is the drop target during column drag
      const isColumnDropTarget =
        dropTargetColumnId !== null &&
        cell.column.id === dropTargetColumnId &&
        draggedColumnId !== null &&
        cell.column.id !== draggedColumnId;

      return (
        <TableCell
          key={cell.id}
          data-cell-index={cellIndex}
          style={getColumnPinningStyles(cell.column)}
          onKeyDown={isDragHandleCell ? undefined : (e) => handleKeyDown(e, row, cellIndex)}
          tabIndex={defaultConfig.enableKeyboardNavigation && !isDragHandleCell ? -1 : undefined}
          role="gridcell"
          className={cn(
            'relative transition-colors duration-150',
            isDragging && 'bg-muted',
            isColumnDropTarget && 'bg-primary/10'
          )}
        >
          {/* Drop indicator line for column drag */}
          {isColumnDropTarget && (
            <div
              className={cn(
                'absolute top-0 bottom-0 w-0.5 bg-primary z-10',
                isDropAtEnd ? 'right-0' : 'left-0'
              )}
            />
          )}
          {/* Drop indicator line for row drag - spans full width of each cell */}
          {isRowDropTarget && (
            <div
              className={cn(
                'absolute left-0 right-0 h-0.5 bg-primary z-10',
                rowDropAtEnd ? 'bottom-0' : 'top-0'
              )}
            />
          )}
          {isDragHandleCell && dragHandleProps ? (
            <div
              {...dragHandleProps}
              className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <IconGripVertical className="h-4 w-4" />
            </div>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      );
    });
  };

  // Render individual row (with or without DnD)
  const renderRow = (row: Row<TData>, index: number) => {
    // Check if this row is the drop target during row drag
    const isRowDropTarget =
      dropTargetRowIndex !== null &&
      index === dropTargetRowIndex &&
      draggedRowId !== null &&
      row.id !== draggedRowId;

    // Only use Draggable when mounted to avoid hydration issues
    if (defaultConfig.enableRowOrdering && isMounted) {
      return (
        <Draggable key={row.id} draggableId={row.id} index={index}>
          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
            <TableRow
              ref={provided.innerRef}
              {...provided.draggableProps}
              data-row-index={index}
              data-state={row.getIsSelected() && 'selected'}
              onClick={() => onRowClick?.(row)}
              onDoubleClick={() => onRowDoubleClick?.(row)}
              className={cn(
                onRowClick && 'cursor-pointer',
                row.getIsSelected() && 'bg-muted/50',
                snapshot.isDragging && 'bg-muted shadow-lg',
                isRowDropTarget && 'bg-primary/5'
              )}
              style={{
                ...provided.draggableProps.style,
              }}
              tabIndex={defaultConfig.enableKeyboardNavigation ? 0 : undefined}
              role="row"
              aria-selected={row.getIsSelected()}
            >
              {renderRowContent(
                row,
                index,
                snapshot.isDragging,
                provided.dragHandleProps,
                isRowDropTarget,
                isRowDropAtEnd
              )}
              {renderRowActions && (
                <TableCell className="w-[50px]">{renderRowActions(row)}</TableCell>
              )}
            </TableRow>
          )}
        </Draggable>
      );
    }

    return (
      <TableRow
        key={row.id}
        data-row-index={index}
        data-state={row.getIsSelected() && 'selected'}
        onClick={() => onRowClick?.(row)}
        onDoubleClick={() => onRowDoubleClick?.(row)}
        className={cn(onRowClick && 'cursor-pointer', row.getIsSelected() && 'bg-muted/50')}
        tabIndex={defaultConfig.enableKeyboardNavigation ? 0 : undefined}
        role="row"
        aria-selected={row.getIsSelected()}
      >
        {row.getVisibleCells().map((cell, cellIndex) => {
          // Check if this cell's column is the drop target during column drag
          const isColumnDropTarget =
            dropTargetColumnId !== null &&
            cell.column.id === dropTargetColumnId &&
            draggedColumnId !== null &&
            cell.column.id !== draggedColumnId;

          return (
            <TableCell
              key={cell.id}
              data-cell-index={cellIndex}
              style={getColumnPinningStyles(cell.column)}
              onKeyDown={(e) => handleKeyDown(e, row, cellIndex)}
              tabIndex={defaultConfig.enableKeyboardNavigation ? -1 : undefined}
              role="gridcell"
              className={cn(
                'relative transition-colors duration-150',
                isColumnDropTarget && 'bg-primary/10'
              )}
            >
              {/* Drop indicator line for column drag */}
              {isColumnDropTarget && (
                <div
                  className={cn(
                    'absolute top-0 bottom-0 w-0.5 bg-primary z-10',
                    isDropAtEnd ? 'right-0' : 'left-0'
                  )}
                />
              )}
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
        {renderRowActions && <TableCell className="w-[50px]">{renderRowActions(row)}</TableCell>}
      </TableRow>
    );
  };

  // Render rows (virtualized or standard)
  const renderRows = () => {
    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={columnsWithDragHandle.length + (renderRowActions ? 1 : 0)}
            className="h-24 text-center"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              emptyMessage
            )}
          </TableCell>
        </TableRow>
      );
    }

    if (defaultConfig.enableVirtualization) {
      const virtualRows = rowVirtualizer.getVirtualItems();

      return (
        <>
          {/* Spacer for virtual scroll */}
          {virtualRows.length > 0 && virtualRows[0]!.start > 0 && (
            <tr style={{ height: virtualRows[0]!.start }} />
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;
            return renderRow(row, virtualRow.index);
          })}
          {/* Bottom spacer */}
          {virtualRows[virtualRows.length - 1] && (
            <tr
              style={{
                height:
                  rowVirtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1]?.end ?? 0),
              }}
            />
          )}
        </>
      );
    }

    return rows.map((row, index) => renderRow(row, index));
  };

  // Render header cell content for portal (during drag)
  const renderHeaderCellForPortal = (header: Header<TData, unknown>) => {
    const headerDef = header.column.columnDef.header;
    if (typeof headerDef === 'function') {
      const rendered = flexRender(headerDef, header.getContext());
      if (typeof rendered !== 'string') {
        return rendered;
      }
      return <span>{rendered}</span>;
    }
    return <span>{headerDef as string}</span>;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <DataTableToolbar
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        enableGlobalFilter={defaultConfig.enableGlobalFilter}
        enableColumnVisibility={defaultConfig.enableColumnVisibility}
        onReset={resetAllState}
        rightContent={toolbarRightContent}
      >
        {toolbarContent}
      </DataTableToolbar>

      {/* Bulk actions bar */}
      {renderBulkActions && (
        <DataTableBulkActions table={table}>{renderBulkActions(table)}</DataTableBulkActions>
      )}

      {/* Table */}
      <div
        ref={tableContainerRef}
        className={cn(
          'rounded-md border',
          // Disable overflow-auto when row ordering is enabled to avoid nested scroll container issues
          // @hello-pangea/dnd doesn't support drag-and-drop within nested scroll containers
          !defaultConfig.enableRowOrdering && 'overflow-auto',
          defaultConfig.enableVirtualization && `h-[${defaultConfig.virtualTableHeight}px]`
        )}
        style={
          defaultConfig.enableVirtualization
            ? { height: defaultConfig.virtualTableHeight }
            : undefined
        }
        role="region"
        aria-label={tableCaption || 'Data table'}
        tabIndex={0}
      >
        <DragDropContext
          onDragStart={handleDragStart}
          onDragUpdate={handleDragUpdate}
          onDragEnd={handleDragEnd}
        >
          <Table
            id={resolvedTableId}
            role="grid"
            aria-rowcount={rows.length}
            disableOverflow={defaultConfig.enableRowOrdering}
          >
            {tableCaption && <caption className="sr-only">{tableCaption}</caption>}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) =>
                defaultConfig.enableColumnOrdering && isMounted ? (
                  <Droppable
                    key={headerGroup.id}
                    droppableId={`columns-${headerGroup.id}`}
                    direction="horizontal"
                    type="COLUMN"
                    mode="virtual"
                    renderClone={(provided, snapshot, rubric) => {
                      const header = headerGroup.headers[rubric.source.index];
                      if (!header) return <div />;
                      return (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-background border-2 border-primary rounded-md px-4 py-2 shadow-xl z-50 font-medium text-sm ring-2 ring-primary/20"
                          style={{
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <IconGripVertical className="h-3 w-3 text-muted-foreground" />
                            {renderHeaderCellForPortal(header)}
                          </div>
                        </div>
                      );
                    }}
                  >
                    {(droppableProvided: DroppableProvided) => (
                      <TableRow
                        ref={droppableProvided.innerRef}
                        {...droppableProvided.droppableProps}
                        role="row"
                      >
                        {headerGroup.headers.map((header, index) => {
                          const canDrag =
                            header.id !== 'select' &&
                            header.id !== 'drag-handle' &&
                            header.column.columnDef.meta?.canReorder !== false;

                          return (
                            <Draggable
                              key={header.id}
                              draggableId={`col-${header.id}`}
                              index={index}
                              isDragDisabled={!canDrag}
                            >
                              {(
                                draggableProvided: DraggableProvided,
                                snapshot: DraggableStateSnapshot
                              ) => {
                                // Determine if this column should show a drop indicator
                                const isDropTarget =
                                  draggedColumnId !== null &&
                                  dragOverColumnIndex === index &&
                                  header.id !== `col-${draggedColumnId}` &&
                                  header.id !== draggedColumnId;

                                return (
                                  <TableHead
                                    ref={draggableProvided.innerRef}
                                    {...draggableProvided.draggableProps}
                                    style={{
                                      ...getColumnPinningStyles(header.column),
                                      ...draggableProvided.draggableProps.style,
                                      width: header.getSize(),
                                    }}
                                    colSpan={header.colSpan}
                                    role="columnheader"
                                    aria-sort={
                                      header.column.getIsSorted()
                                        ? header.column.getIsSorted() === 'asc'
                                          ? 'ascending'
                                          : 'descending'
                                        : undefined
                                    }
                                    className={cn(
                                      'relative transition-colors duration-150',
                                      snapshot.isDragging &&
                                        'opacity-50 bg-muted ring-2 ring-primary ring-offset-1',
                                      isDropTarget && 'bg-primary/10'
                                    )}
                                  >
                                    {/* Drop indicator line */}
                                    {isDropTarget && (
                                      <div
                                        className={cn(
                                          'absolute top-0 bottom-0 w-0.5 bg-primary z-10',
                                          isDropAtEnd ? 'right-0' : 'left-0'
                                        )}
                                      />
                                    )}
                                    {renderHeaderCell(
                                      header,
                                      canDrag ? draggableProvided.dragHandleProps : undefined
                                    )}
                                    {/* Resize handle */}
                                    {defaultConfig.enableColumnResizing &&
                                      header.column.getCanResize() && (
                                        <div
                                          onMouseDown={header.getResizeHandler()}
                                          onTouchStart={header.getResizeHandler()}
                                          onDoubleClick={() => header.column.resetSize()}
                                          className={cn(
                                            'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none',
                                            'bg-transparent hover:bg-primary/50',
                                            header.column.getIsResizing() && 'bg-primary'
                                          )}
                                        />
                                      )}
                                  </TableHead>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {/* Note: No placeholder when mode="virtual" - renderClone handles it */}
                        {renderRowActions && <TableHead className="w-[50px]" />}
                      </TableRow>
                    )}
                  </Droppable>
                ) : (
                  <TableRow key={headerGroup.id} role="row">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{
                          ...getColumnPinningStyles(header.column),
                          width: header.getSize(),
                        }}
                        colSpan={header.colSpan}
                        role="columnheader"
                        aria-sort={
                          header.column.getIsSorted()
                            ? header.column.getIsSorted() === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : undefined
                        }
                      >
                        {renderHeaderCell(header, undefined)}
                        {/* Resize handle */}
                        {defaultConfig.enableColumnResizing && header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            onDoubleClick={() => header.column.resetSize()}
                            className={cn(
                              'absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none',
                              'bg-transparent hover:bg-primary/50',
                              header.column.getIsResizing() && 'bg-primary'
                            )}
                          />
                        )}
                      </TableHead>
                    ))}
                    {renderRowActions && <TableHead className="w-[50px]" />}
                  </TableRow>
                )
              )}
            </TableHeader>
            {defaultConfig.enableRowOrdering && isMounted ? (
              <Droppable
                droppableId="rows"
                type="ROW"
                renderClone={(provided, snapshot, rubric) => {
                  // Render a div clone (not tr) that gets portaled to document.body
                  // This avoids nested scroll container issues and HTML structure errors
                  const row = rows[rubric.source.index];
                  if (!row) return <div ref={provided.innerRef} />;
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center gap-2 bg-background border rounded-md shadow-lg p-3"
                      style={{
                        ...provided.draggableProps.style,
                      }}
                    >
                      <IconGripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {/* Display first text column value as preview */}
                        {(row
                          .getVisibleCells()
                          .find(
                            (cell) =>
                              cell.column.id !== 'select' && cell.column.id !== 'drag-handle'
                          )
                          ?.getValue() as string) || `Row ${rubric.source.index + 1}`}
                      </span>
                    </div>
                  );
                }}
              >
                {(droppableProvided: DroppableProvided) => (
                  <TableBody
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    style={
                      defaultConfig.enableVirtualization
                        ? {
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            position: 'relative',
                          }
                        : undefined
                    }
                  >
                    {renderRows()}
                    {droppableProvided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            ) : (
              <TableBody
                style={
                  defaultConfig.enableVirtualization
                    ? {
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        position: 'relative',
                      }
                    : undefined
                }
              >
                {renderRows()}
              </TableBody>
            )}
          </Table>
        </DragDropContext>
      </div>

      {/* Loading indicator for virtual scroll */}
      {isLoading && rows.length > 0 && (
        <div className="flex justify-center py-2">
          <IconLoader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      {/* Pagination */}
      {pagination ? (
        <DataTableLoadMore pagination={pagination} onLoadMore={onLoadMore!} isLoading={isLoading} />
      ) : (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}

// Re-export sub-components for custom usage
export { DataTableColumnHeader, getColumnPinningStyles } from './column-header';
export { DataTableToolbar, DataTableBulkActions } from './toolbar';
export { DataTablePagination, DataTableLoadMore, DataTableInfiniteScroll } from './pagination';
export type * from './types';
