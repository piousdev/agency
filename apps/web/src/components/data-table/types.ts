import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  Row,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState,
} from '@tanstack/react-table';

/**
 * Cursor-based pagination state
 */
export interface CursorPaginationState {
  cursor: string | null;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount?: number;
}

/**
 * Data table configuration options
 */
export interface DataTableConfig {
  /** Enable row selection (single or multi) */
  enableRowSelection?: boolean | 'single' | 'multi';
  /** Enable column visibility toggle */
  enableColumnVisibility?: boolean;
  /** Enable column ordering (drag-and-drop) */
  enableColumnOrdering?: boolean;
  /** Enable column pinning (left/right) */
  enableColumnPinning?: boolean;
  /** Enable column resizing */
  enableColumnResizing?: boolean;
  /** Enable sorting */
  enableSorting?: boolean;
  /** Enable global filter search */
  enableGlobalFilter?: boolean;
  /** Enable column filters */
  enableColumnFilters?: boolean;
  /** Enable virtual scrolling for large datasets */
  enableVirtualization?: boolean;
  /** Enable row ordering (drag-and-drop) */
  enableRowOrdering?: boolean;
  /** Estimated row height for virtualization */
  estimatedRowHeight?: number;
  /** Overscan count for virtualization */
  virtualOverscan?: number;
  /** Table height for virtualization (required when enableVirtualization is true) */
  virtualTableHeight?: number;
  /** Enable keyboard navigation (arrow keys) */
  enableKeyboardNavigation?: boolean;
  /** Manual server-side operations */
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
}

/**
 * Props for the DataTable component
 */
export interface DataTableProps<TData> {
  /** Column definitions */
  columns: ColumnDef<TData, unknown>[];
  /** Data to display */
  data: TData[];
  /** Configuration options */
  config?: DataTableConfig;
  /** Initial sorting state */
  initialSorting?: SortingState;
  /** Initial column filters */
  initialColumnFilters?: ColumnFiltersState;
  /** Initial column visibility */
  initialColumnVisibility?: VisibilityState;
  /** Initial column order */
  initialColumnOrder?: ColumnOrderState;
  /** Initial column pinning */
  initialColumnPinning?: ColumnPinningState;
  /** Initial row selection */
  initialRowSelection?: RowSelectionState;
  /** Callback when sorting changes */
  onSortingChange?: (sorting: SortingState) => void;
  /** Callback when column filters change */
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  /** Callback when global filter changes */
  onGlobalFilterChange?: (filter: string) => void;
  /** Callback when row selection changes */
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  /** Callback when a row is clicked */
  onRowClick?: (row: Row<TData>) => void;
  /** Callback when a row is double-clicked */
  onRowDoubleClick?: (row: Row<TData>) => void;
  /** Callback when row order changes (for row drag-and-drop).
   * Provides the new order of row IDs after the drag operation.
   * The parent component should reorder its data to match this ID order. */
  onRowOrderChange?: (newRowIdOrder: string[]) => void;
  /** Cursor pagination state */
  pagination?: CursorPaginationState;
  /** Callback to load more data */
  onLoadMore?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Render function for row actions */
  renderRowActions?: (row: Row<TData>) => React.ReactNode;
  /** Render function for bulk actions (shown when rows selected) */
  renderBulkActions?: (table: Table<TData>) => React.ReactNode;
  /** Custom toolbar content */
  toolbarContent?: React.ReactNode;
  /** Table ID for accessibility */
  tableId?: string;
  /** Table caption for accessibility */
  tableCaption?: string;
  /** CSS class name */
  className?: string;
  /** Get row ID for selection tracking */
  getRowId?: (row: TData) => string;
}

/**
 * Return type for the useDataTable hook
 */
export interface UseDataTableReturn<TData> {
  table: Table<TData>;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
  columnPinning: ColumnPinningState;
  columnSizing: ColumnSizingState;
  rowSelection: RowSelectionState;
  setGlobalFilter: (filter: string) => void;
  setSorting: (sorting: SortingState) => void;
  setColumnFilters: (filters: ColumnFiltersState) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  setColumnOrder: (order: ColumnOrderState) => void;
  setColumnPinning: (pinning: ColumnPinningState) => void;
  setRowSelection: (selection: RowSelectionState) => void;
  resetColumnOrder: () => void;
  resetColumnVisibility: () => void;
  resetColumnPinning: () => void;
  resetRowSelection: () => void;
  resetAllState: () => void;
}

/**
 * Column meta for extended column configuration
 */
export interface DataTableColumnMeta {
  /** Display name for column visibility toggle */
  displayName?: string;
  /** Whether column can be hidden */
  canHide?: boolean;
  /** Whether column can be pinned */
  canPin?: boolean;
  /** Whether column can be resized */
  canResize?: boolean;
  /** Whether column can be reordered */
  canReorder?: boolean;
  /** Filter type for the column */
  filterType?: 'text' | 'select' | 'multi-select' | 'date' | 'number-range';
  /** Filter options for select/multi-select */
  filterOptions?: { label: string; value: string }[];
  /** Cell alignment */
  align?: 'left' | 'center' | 'right';
}

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends unknown, TValue> extends DataTableColumnMeta {}
}
