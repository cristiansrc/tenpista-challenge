import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

export interface TransactionFilterValues {
  tenpistaName: string;
  commerceName: string;
  fromDate: string;
  toDate: string;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFilterValues) => void;
}

export function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<TransactionFilterValues>({
    tenpistaName: "",
    commerceName: "",
    fromDate: "",
    toDate: "",
  });
  const filterInputId = "transaction-tenpista-filter";
  const commerceInputId = "transaction-commerce-filter";
  const fromDateInputId = "transaction-date-from-filter";
  const toDateInputId = "transaction-date-to-filter";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filters, onFilterChange]);

  const handleTextChange =
    (field: "tenpistaName" | "commerceName") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleDateChange =
    (field: "fromDate" | "toDate") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleClearOne = (field: keyof TransactionFilterValues) => {
    setFilters((prev) => ({ ...prev, [field]: "" }));
  };

  const handleClearAll = () => {
    setFilters({ tenpistaName: "", commerceName: "", fromDate: "", toDate: "" });
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-4">
      <div className="relative w-full">
        <label htmlFor={filterInputId} className="sr-only">
          Buscar transacciones por nombre de Tenpista
        </label>
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id={filterInputId}
          placeholder="Buscar por Tenpista..."
          value={filters.tenpistaName}
          onChange={handleTextChange("tenpistaName")}
          className="w-full pl-8"
          aria-label="Filtrar por nombre de Tenpista"
        />
        {filters.tenpistaName && (
          <button
            onClick={() => handleClearOne("tenpistaName")}
            className="absolute right-2.5 top-2.5 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
            aria-label="Limpiar filtro"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative w-full">
        <label htmlFor={commerceInputId} className="sr-only">
          Buscar transacciones por comercio
        </label>
        <Input
          id={commerceInputId}
          placeholder="Filtrar por comercio..."
          value={filters.commerceName}
          onChange={handleTextChange("commerceName")}
          className="w-full"
          aria-label="Filtrar por comercio"
        />
        {filters.commerceName && (
          <button
            onClick={() => handleClearOne("commerceName")}
            className="absolute right-2.5 top-2.5 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
            aria-label="Limpiar filtro de comercio"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="w-full">
        <label htmlFor={fromDateInputId} className="sr-only">
          Filtrar desde fecha
        </label>
        <Input
          id={fromDateInputId}
          type="date"
          value={filters.fromDate}
          onChange={handleDateChange("fromDate")}
          aria-label="Filtrar desde fecha"
          max={filters.toDate || undefined}
        />
      </div>

      <div className="flex w-full items-center gap-2">
        <div className="flex-1">
          <label htmlFor={toDateInputId} className="sr-only">
            Filtrar hasta fecha
          </label>
          <Input
            id={toDateInputId}
            type="date"
            value={filters.toDate}
            onChange={handleDateChange("toDate")}
            aria-label="Filtrar hasta fecha"
            min={filters.fromDate || undefined}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleClearAll}
          disabled={!hasActiveFilters}
          aria-label="Limpiar todos los filtros"
        >
          Limpiar
        </Button>
      </div>
    </div>
  );
}
