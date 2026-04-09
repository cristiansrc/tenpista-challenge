import { DataTablePagination } from "@/components/refine-ui/data-table/data-table-pagination";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { BaseRecord, HttpError } from "@refinedev/core";
import type { UseTableReturnType } from "@refinedev/react-table";
import { flexRender } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DataTableProps<TData extends BaseRecord> = {
  table: UseTableReturnType<TData, HttpError>;
};

export function DataTable<TData extends BaseRecord>({ table }: DataTableProps<TData>) {
  const {
    reactTable: { getHeaderGroups, getRowModel, getAllLeafColumns },
    refineCore: { tableQuery, currentPage, setCurrentPage, pageCount, pageSize, setPageSize },
  } = table;

  const isLoading = tableQuery.isLoading;
  const isError = tableQuery.isError;
  const total = tableQuery.data?.total;
  const leafColumns = getAllLeafColumns();

  return (
    <div className="flex flex-col flex-1 gap-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="relative">
            {isLoading ? (
              <>
                {Array.from({ length: pageSize < 1 ? 1 : pageSize }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} aria-hidden>
                    {leafColumns.map((col) => (
                      <TableCell key={`skeleton-${i}-${col.id}`}>
                        <div className="h-8 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={leafColumns.length} className="absolute inset-0 pointer-events-none">
                    <Loader2 className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              </>
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={leafColumns.length} className="text-center py-16">
                  <div className={cn("flex flex-col items-center gap-3")}>
                    <p className="text-lg font-semibold text-destructive">Error al cargar transacciones</p>
                    <p className="text-sm text-muted-foreground">
                      Revisa tu conexión o vuelve a intentarlo.
                    </p>
                    <Button variant="outline" onClick={() => tableQuery.refetch()}>
                      Reintentar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : getRowModel().rows?.length ? (
              getRowModel().rows.map((row) => (
                <TableRow key={row.original?.id ?? row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="truncate max-w-[200px]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={leafColumns.length} className="text-center py-20">
                  <div className={cn("flex flex-col items-center gap-2")}>
                    <p className="text-lg font-semibold text-foreground">Sin transacciones</p>
                    <p className="text-sm text-muted-foreground">
                      No hay transacciones registradas aún.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && !isError && (total ?? 0) > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          pageCount={pageCount}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          total={total}
        />
      )}
    </div>
  );
}
