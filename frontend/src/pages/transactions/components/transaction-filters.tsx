import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TransactionFiltersProps {
  onFilterChange: (tenpistaName: string) => void;
}

export function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onFilterChange(value);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, onFilterChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleClear = () => {
    setValue("");
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por Tenpista..."
          value={value}
          onChange={handleChange}
          className="pl-8 w-64"
          aria-label="Filtrar por nombre de Tenpista"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            type="button"
            aria-label="Limpiar filtro"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
