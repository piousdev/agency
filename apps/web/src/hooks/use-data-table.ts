'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  type TableOptions,
} from '@tanstack/react-table';
import type { DataTableConfig, UseDataTableReturn } from '@/components/data-table/types';

/**
 * Extract column ID from a ColumnDef.
 * TanStack Table generates IDs from accessorKey by replacing dots with underscores.
 */
function getColumnId<TData>(column: ColumnDef<TData, unknown>): string | null {
  // Explicit id takes precedence
  if (column.id) return column.id;

  // Check for accessorKey (string accessor)
  if ('accessorKey' in column && typeof column.accessorKey === 'string') {
    // TanStack Table replaces dots with underscores in generated IDs
    return column.accessorKey.replace(/\./g, '_');
  }

  // accessorFn columns without id can't be identified
  return null;
}

/**
 * Extract all column IDs from column definitions
 */
function getColumnIds<TData>(columns: ColumnDef<TData, unknown>[]): string[] {
  return columns.map((c) => getColumnId(c)).filter((id): id is string => id !== null);
}

interface UseDataTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  config?: DataTableConfig;
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialColumnVisibility?: VisibilityState;
  initialColumnOrder?: ColumnOrderState;
  initialColumnPinning?: ColumnPinningState;
  initialRowSelection?: RowSelectionState;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onGlobalFilterChange?: (filter: string) => void;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  getRowId?: (row: TData) => string;
}

/**
 * useDataTable - Core hook for enterprise data table functionality
 *
 * Provides:
 * - Sorting (client/server-side)
 * - Filtering (column + global)
 * - Column visibility, ordering, pinning, resizing
 * - Row selection (single/multi)
 * - Faceted filters (unique values, min/max)
 */
export function useDataTable<TData>({
  data,
  columns,
  config = {},
  initialSorting = [],
  initialColumnFilters = [],
  initialColumnVisibility = {},
  initialColumnOrder = [],
  initialColumnPinning = {},
  initialRowSelection = {},
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
  onRowSelectionChange,
  getRowId,
}: UseDataTableOptions<TData>): UseDataTableReturn<TData> {
  const {
    enableRowSelection = false,
    enableColumnVisibility = true,
    enableColumnOrdering = true,
    enableColumnPinning = true,
    enableColumnResizing = true,
    enableSorting = true,
    enableGlobalFilter = true,
    enableColumnFilters = true,
    manualSorting = false,
    manualFiltering = false,
    manualPagination = false,
  } = config;

  // State
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(initialColumnVisibility);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    initialColumnOrder.length > 0 ? initialColumnOrder : getColumnIds(columns)
  );
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialColumnPinning);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialRowSelection);

  // Wrap state setters to call external callbacks
  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSorting((old) => {
        const newValue = typeof updater === 'function' ? updater(old) : updater;
        onSortingChange?.(newValue);
        return newValue;
      });
    },
    [onSortingChange]
  );

  const handleColumnFiltersChange = useCallback(
    (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
      setColumnFilters((old) => {
        const newValue = typeof updater === 'function' ? updater(old) : updater;
        onColumnFiltersChange?.(newValue);
        return newValue;
      });
    },
    [onColumnFiltersChange]
  );

  const handleGlobalFilterChange = useCallback(
    (value: string) => {
      setGlobalFilter(value);
      onGlobalFilterChange?.(value);
    },
    [onGlobalFilterChange]
  );

  const handleRowSelectionChange = useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      setRowSelection((old) => {
        const newValue = typeof updater === 'function' ? updater(old) : updater;
        onRowSelectionChange?.(newValue);
        return newValue;
      });
    },
    [onRowSelectionChange]
  );

  // Determine row selection mode
  const rowSelectionMode = useMemo(() => {
    if (enableRowSelection === true || enableRowSelection === 'multi') {
      return true;
    }
    if (enableRowSelection === 'single') {
      return (row: { original: TData }) => true;
    }
    return false;
  }, [enableRowSelection]);

  // Table options
  const tableOptions: TableOptions<TData> = useMemo(
    () => ({
      data,
      columns,
      state: {
        sorting,
        columnFilters,
        globalFilter,
        columnVisibility,
        columnOrder,
        columnPinning,
        columnSizing,
        rowSelection,
      },
      // State change handlers
      onSortingChange: handleSortingChange,
      onColumnFiltersChange: handleColumnFiltersChange,
      onGlobalFilterChange: handleGlobalFilterChange,
      onColumnVisibilityChange: setColumnVisibility,
      onColumnOrderChange: setColumnOrder,
      onColumnPinningChange: setColumnPinning,
      onColumnSizingChange: setColumnSizing,
      onRowSelectionChange: handleRowSelectionChange,
      // Feature enablement
      enableSorting,
      enableColumnFilters,
      enableGlobalFilter,
      enableColumnResizing,
      enableRowSelection: !!enableRowSelection,
      enableMultiRowSelection: enableRowSelection === true || enableRowSelection === 'multi',
      // Manual operations (for server-side)
      manualSorting,
      manualFiltering,
      manualPagination,
      // Row models
      getCoreRowModel: getCoreRowModel(),
      ...(enableSorting && !manualSorting && { getSortedRowModel: getSortedRowModel() }),
      ...((enableColumnFilters || enableGlobalFilter) &&
        !manualFiltering && { getFilteredRowModel: getFilteredRowModel() }),
      ...(!manualPagination && { getPaginationRowModel: getPaginationRowModel() }),
      // Faceted models for filter dropdowns
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
      getFacetedMinMaxValues: getFacetedMinMaxValues(),
      // Column resizing
      columnResizeMode: 'onChange',
      // Row ID
      ...(getRowId && { getRowId: (row) => getRowId(row) }),
      // Debug
      debugTable: process.env.NODE_ENV === 'development',
    }),
    [
      data,
      columns,
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnOrder,
      columnPinning,
      columnSizing,
      rowSelection,
      handleSortingChange,
      handleColumnFiltersChange,
      handleGlobalFilterChange,
      handleRowSelectionChange,
      enableSorting,
      enableColumnFilters,
      enableGlobalFilter,
      enableColumnResizing,
      enableRowSelection,
      manualSorting,
      manualFiltering,
      manualPagination,
      getRowId,
    ]
  );

  const table = useReactTable(tableOptions);

  // Reset functions
  const resetColumnOrder = useCallback(() => {
    setColumnOrder(getColumnIds(columns));
  }, [columns]);

  const resetColumnVisibility = useCallback(() => {
    setColumnVisibility({});
  }, []);

  const resetColumnPinning = useCallback(() => {
    setColumnPinning({});
  }, []);

  const resetRowSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  const resetAllState = useCallback(() => {
    setSorting([]);
    setColumnFilters([]);
    setGlobalFilter('');
    setColumnVisibility({});
    setColumnOrder(getColumnIds(columns));
    setColumnPinning({});
    setColumnSizing({});
    setRowSelection({});
  }, [columns]);

  return {
    table,
    sorting,
    columnFilters,
    globalFilter,
    columnVisibility,
    columnOrder,
    columnPinning,
    columnSizing,
    rowSelection,
    setGlobalFilter: handleGlobalFilterChange,
    setSorting: handleSortingChange,
    setColumnFilters: handleColumnFiltersChange,
    setColumnVisibility,
    setColumnOrder,
    setColumnPinning,
    setRowSelection: handleRowSelectionChange,
    resetColumnOrder,
    resetColumnVisibility,
    resetColumnPinning,
    resetRowSelection,
    resetAllState,
  };
}
