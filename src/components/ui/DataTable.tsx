import { useEffect, useState, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Select } from './Form';
import { EmptyState } from './misc';

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  /** Accessible name for the table. */
  label: string;
  searchPlaceholder?: string;
  /** Controlled search text (e.g. synced with ?q= in the URL). */
  search?: string;
  onSearchChange?: (q: string) => void;
  /** Extra controls rendered left of the export button. */
  filters?: ReactNode;
  initialSorting?: SortingState;
  pageSize?: number;
  /** Receives all rows that pass search + filters (every page), sorted. */
  onExport?: (rows: T[]) => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  minWidth?: number;
}

/**
 * Generic table built on TanStack Table: global search, column sorting,
 * pagination with page-size picker and CSV export of the filtered result.
 */
export function DataTable<T>({
  data,
  columns,
  label,
  searchPlaceholder = 'Search…',
  search,
  onSearchChange,
  filters,
  initialSorting = [],
  pageSize = 10,
  onExport,
  onRowClick,
  emptyTitle = 'No results',
  emptyDescription = 'Try a different search term or clear the filters.',
  minWidth = 720,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [localSearch, setLocalSearch] = useState('');
  const globalFilter = search ?? localSearch;
  const setGlobalFilter = onSearchChange ?? setLocalSearch;

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: (v: string) => setGlobalFilter(v ?? ''),
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize, pageIndex: 0 } },
    autoResetPageIndex: false,
  });

  // Back to page 1 whenever the result set changes.
  useEffect(() => {
    table.setPageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter, data]);

  const filteredCount = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize: size } = table.getState().pagination;
  const from = filteredCount === 0 ? 0 : pageIndex * size + 1;
  const to = Math.min(filteredCount, (pageIndex + 1) * size);
  const rows = table.getRowModel().rows;

  const exportRows = () => onExport?.(table.getPrePaginationRowModel().rows.map((r: Row<T>) => r.original));

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-4 sm:px-5">
        <label className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <span className="sr-only">Search {label.toLowerCase()}</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-[10px] border border-line-strong bg-surface pl-9 pr-3 text-sm placeholder:text-muted/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        {filters}
        {onExport && (
          <Button variant="secondary" onClick={exportRows} disabled={filteredCount === 0} className="sm:ml-auto">
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ minWidth }} aria-label={label}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-surface-2 text-left text-xs uppercase tracking-[0.05em] text-muted">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const dir = header.column.getIsSorted();
                  const align = (header.column.columnDef.meta as { align?: 'right' } | undefined)?.align;
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : undefined}
                      className={cn('whitespace-nowrap px-4 py-3 font-semibold first:pl-5 last:pr-5', align === 'right' && 'text-right')}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            '-mx-1 inline-flex items-center gap-1 rounded px-1 py-1 uppercase hover:text-fg',
                            align === 'right' && 'flex-row-reverse',
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {dir === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                          ) : dir === 'desc' ? (
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn('border-t border-line', onRowClick && 'cursor-pointer hover:bg-surface-2')}
              >
                {row.getVisibleCells().map((cell) => {
                  const align = (cell.column.columnDef.meta as { align?: 'right' } | undefined)?.align;
                  return (
                    <td key={cell.id} className={cn('whitespace-nowrap px-4 py-3.5 first:pl-5 last:pr-5', align === 'right' && 'text-right')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <EmptyState title={emptyTitle} description={emptyDescription} />}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-muted sm:px-5">
        <span aria-live="polite">
          {from}–{to} of {filteredCount}
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <span className="hidden sm:inline">Rows</span>
            <Select
              aria-label="Rows per page"
              value={size}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-9 w-[76px] pr-8"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </label>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
            className="w-9 px-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[64px] text-center">
            {pageIndex + 1} / {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
            className="w-9 px-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
