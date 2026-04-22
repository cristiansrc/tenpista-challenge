import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

const mockTable = (overrides = {}) => ({
  reactTable: {
    getHeaderGroups: () => [],
    getRowModel: () => ({ rows: [] }),
    getAllLeafColumns: () => [],
    ...overrides.reactTable,
  },
  refineCore: {
    tableQuery: {
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      data: { total: 0 },
      ...overrides.tableQuery,
    },
    currentPage: 1,
    setCurrentPage: vi.fn(),
    pageCount: 1,
    pageSize: 10,
    setPageSize: vi.fn(),
    ...overrides.refineCore,
  },
});

describe("DataTable", () => {
  it("renders loading skeleton state", () => {
    const table = mockTable({ tableQuery: { isLoading: true } });
    render(<DataTable table={table as any} />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders error state and retries", () => {
    const table = mockTable({ tableQuery: { isError: true } });
    render(<DataTable table={table as any} />);

    expect(screen.getByText(/Error al cargar/i)).toBeInTheDocument();
    const retryBtn = screen.getByText(/Reintentar/i);
    fireEvent.click(retryBtn);
    expect(table.refineCore.tableQuery.refetch).toHaveBeenCalled();
  });

  it("renders empty state and create callback", () => {
    const onCreate = vi.fn();
    const table = mockTable();
    render(<DataTable table={table as any} onCreateTransaction={onCreate} />);

    expect(screen.getByText(/Sin transacciones/i)).toBeInTheDocument();
    const createBtn = screen.getByText(/Crear primera/i);
    fireEvent.click(createBtn);
    expect(onCreate).toHaveBeenCalled();
  });

  it("renders rows and pagination when data exists", () => {
    const table = mockTable({
      reactTable: {
        getHeaderGroups: () => [{ id: "h1", headers: [] }],
        getRowModel: () => ({
          rows: [
            {
              id: "r1",
              getVisibleCells: () => [],
              getIsSelected: () => false,
              original: { id: 1 },
            },
          ],
        }),
        getAllLeafColumns: () => [],
      },
      tableQuery: { data: { total: 50 } },
      refineCore: { pageCount: 5 },
    });

    render(<DataTable table={table as any} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText(/transacciones en total/i)).toBeInTheDocument();
  });
});
