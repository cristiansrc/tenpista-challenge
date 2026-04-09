import { useState, useCallback } from "react";
import { useTable } from "@refinedev/react-table";
import { type ColumnDef } from "@tanstack/react-table";
import type { HttpError } from "@refinedev/core";
import type { Transaction } from "@/types/transaction";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { TransactionForm } from "./components/transaction-form";
import { TransactionFilters } from "./components/transaction-filters";
import type { TransactionFilterValues } from "./components/transaction-filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 80,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    size: 140,
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono font-semibold">
        {formatCurrency(row.original.amount)}
      </Badge>
    ),
  },
  {
    accessorKey: "commerce_name",
    header: "Comercio",
    size: 180,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.commerce_name}</span>
    ),
  },
  {
    accessorKey: "tenpista_name",
    header: "Tenpista",
    size: 180,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-xs font-medium text-primary">
            {row.original.tenpista_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <span>{row.original.tenpista_name}</span>
      </div>
    ),
  },
  {
    accessorKey: "transaction_date",
    header: "Fecha",
    size: 180,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.transaction_date)}
      </span>
    ),
  },
];

export default function TransactionList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilterValues>({
    tenpistaName: "",
    commerceName: "",
    fromDate: "",
    toDate: "",
  });

  const table = useTable<Transaction, HttpError>({
    columns,
    refineCoreProps: {
      resource: "transactions",
      pagination: { mode: "server" },
      filters: {
        permanent: [
          ...(filters.tenpistaName
            ? [{ field: "tenpista_name", operator: "contains" as const, value: filters.tenpistaName }]
            : []),
          ...(filters.commerceName
            ? [{ field: "commerce_name", operator: "contains" as const, value: filters.commerceName }]
            : []),
          ...(filters.fromDate
            ? [{ field: "transaction_date_from", operator: "eq" as const, value: filters.fromDate }]
            : []),
          ...(filters.toDate
            ? [{ field: "transaction_date_to", operator: "eq" as const, value: filters.toDate }]
            : []),
        ],
      },
      sorters: {
        permanent: [{ field: "transaction_date", order: "desc" }],
      },
    },
  });

  const handleFilterChange = useCallback((value: TransactionFilterValues) => {
    setFilters(value);
    table.refineCore.setCurrentPage(1);
  }, [table.refineCore]);

  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transacciones</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Historial de movimientos de Tenpistas
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Nueva Transacción
        </Button>
      </div>

      {/* Filtros */}
      <TransactionFilters onFilterChange={handleFilterChange} />

      {/* Tabla */}
      <DataTable table={table} onCreateTransaction={() => setIsFormOpen(true)} />

      {/* Formulario modal */}
      <TransactionForm open={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
