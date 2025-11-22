'use client';

import { useRef, useCallback, useMemo, useId, useState } from 'react';
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
  type DraggableProvided,
  type DroppableProvided,
  type DraggableStateSnapshot,
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
import { GripVertical, Loader2 } from 'lucide-react';
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
            <GripVertical className="h-4 w-4" />
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
  const { table, globalFilter, setGlobalFilter, columnOrder, setColumnOrder, resetAllState } =
    useDataTable({
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
  const handleDragStart = useCallback((result: { draggableId: string; type: string }) => {
    if (result.type === 'COLUMN') {
      setDragMode('column');
    } else if (result.type === 'ROW') {
      setDragMode('row');
    }
  }, []);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      setDragMode(null);

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
        const visibleHeaders = table.getAllLeafColumns().map((c) => c.id);

        // Get the column ID at the destination position
        const destHeaderId = visibleHeaders[result.destination.index];

        // Don't allow dropping on special columns
        if (destHeaderId === 'select' || destHeaderId === 'drag-handle') {
          return;
        }

        // Find source and destination indices in the columnOrder array
        const sourceOrderIndex = columnOrder.indexOf(draggedColumnId);
        const destOrderIndex = columnOrder.indexOf(destHeaderId);

        if (sourceOrderIndex === -1 || destOrderIndex === -1) return;
        if (sourceOrderIndex === destOrderIndex) return;

        // Reorder the array using arrayMove pattern
        const newOrder = [...columnOrder];
        const [removed] = newOrder.splice(sourceOrderIndex, 1);
        if (removed) {
          // When source < dest, the dest index shifts down by 1 after removal
          const adjustedDestIndex =
            sourceOrderIndex < destOrderIndex ? destOrderIndex - 1 : destOrderIndex;
          newOrder.splice(adjustedDestIndex, 0, removed);
          setColumnOrder(newOrder);
        }
      } else if (result.type === 'ROW') {
        // Row reordering
        if (onRowOrderChange) {
          const sourceIndex = result.source.index;
          const destinationIndex = result.destination.index;
          onRowOrderChange(sourceIndex, destinationIndex);
        }
      }
    },
    [columnOrder, setColumnOrder, onRowOrderChange, table]
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
    dragHandleProps?: DraggableProvided['dragHandleProps']
  ) => {
    return row.getVisibleCells().map((cell, cellIndex) => {
      const isDragHandleCell = cell.column.id === 'drag-handle';
      return (
        <TableCell
          key={cell.id}
          data-cell-index={cellIndex}
          style={getColumnPinningStyles(cell.column)}
          onKeyDown={isDragHandleCell ? undefined : (e) => handleKeyDown(e, row, cellIndex)}
          tabIndex={defaultConfig.enableKeyboardNavigation && !isDragHandleCell ? -1 : undefined}
          role="gridcell"
          className={cn(isDragging && 'bg-muted')}
        >
          {isDragHandleCell && dragHandleProps ? (
            <div
              {...dragHandleProps}
              className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
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
    if (defaultConfig.enableRowOrdering) {
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
                snapshot.isDragging && 'bg-muted shadow-lg'
              )}
              style={{
                ...provided.draggableProps.style,
              }}
              tabIndex={defaultConfig.enableKeyboardNavigation ? 0 : undefined}
              role="row"
              aria-selected={row.getIsSelected()}
            >
              {renderRowContent(row, index, snapshot.isDragging, provided.dragHandleProps)}
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
        {row.getVisibleCells().map((cell, cellIndex) => (
          <TableCell
            key={cell.id}
            data-cell-index={cellIndex}
            style={getColumnPinningStyles(cell.column)}
            onKeyDown={(e) => handleKeyDown(e, row, cellIndex)}
            tabIndex={defaultConfig.enableKeyboardNavigation ? -1 : undefined}
            role="gridcell"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
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
                <Loader2 className="h-4 w-4 animate-spin" />
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
          'rounded-md border overflow-auto',
          defaultConfig.enableVirtualization && `h-[${defaultConfig.virtualTableHeight}px]`
        )}
        style={
          defaultConfig.enableVirtualization
            ? { height: defaultConfig.virtualTableHeight, overflow: 'auto' }
            : undefined
        }
        role="region"
        aria-label={tableCaption || 'Data table'}
        tabIndex={0}
      >
        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Table id={resolvedTableId} role="grid" aria-rowcount={rows.length}>
            {tableCaption && <caption className="sr-only">{tableCaption}</caption>}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) =>
                defaultConfig.enableColumnOrdering ? (
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
                          className="bg-background border rounded px-4 py-2 shadow-lg z-50 font-medium text-sm"
                          style={{
                            ...provided.draggableProps.style,
                          }}
                        >
                          {renderHeaderCellForPortal(header)}
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
                              ) => (
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
                                  className={cn(snapshot.isDragging && 'opacity-50 bg-muted')}
                                >
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
                              )}
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
            {defaultConfig.enableRowOrdering ? (
              <Droppable droppableId="rows" type="ROW">
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
          <Loader2 className="h-4 w-4 animate-spin" />
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
