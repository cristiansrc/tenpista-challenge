import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTablePaginationProps {
  currentPage: number;
  pageCount: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  total?: number;
}

export function DataTablePagination({
  currentPage,
  pageCount,
  setCurrentPage,
  pageSize,
  setPageSize,
  total,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {total !== undefined && (
          <span>{total.toLocaleString("es-CL")} transacciones en total</span>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Filas por página</p>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {currentPage} de {pageCount || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => setCurrentPage(1)} disabled={currentPage <= 1} aria-label="Primera página">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Página anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= pageCount} aria-label="Página siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => setCurrentPage(pageCount)} disabled={currentPage >= pageCount} aria-label="Última página">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
