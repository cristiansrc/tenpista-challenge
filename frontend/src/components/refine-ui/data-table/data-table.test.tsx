import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./data-table";

vi.mock("@/components/refine-ui/data-table/data-table-pagination", () => ({
  DataTablePagination: () => <div>mock-pagination</div>,
}));

type TableQueryState = {
  isLoading: boolean;
  isError: boolean;
  total?: number;
  refetch?: () => void;
};

function createTable(tableQuery: TableQueryState, rows: Array<{ id: number; value: string }> = []) {
  const getRowModel = () => ({
    rows: rows.map((r) => ({
      original: { id: r.id },
      id: String(r.id),
      getIsSelected: () => false,
      getVisibleCells: () => [
        {
          id: `cell-${r.id}`,
          column: { columnDef: { cell: () => r.value } },
          getContext: () => ({}),
        },
      ],
    })),
  });

  return {
    reactTable: {
      getHeaderGroups: () => [
        {
          id: "hg-1",
          headers: [
            {
              id: "h-1",
              isPlaceholder: false,
              column: { columnDef: { header: "Columna" } },
              getContext: () => ({}),
            },
          ],
        },
      ],
      getRowModel,
      getAllLeafColumns: () => [{ id: "col-1" }],
    },
    refineCore: {
      tableQuery: {
        isLoading: tableQuery.isLoading,
        isError: tableQuery.isError,
        data: tableQuery.total !== undefined ? { total: tableQuery.total } : undefined,
        refetch: tableQuery.refetch ?? vi.fn(),
      },
      currentPage: 1,
      setCurrentPage: vi.fn(),
      pageCount: 2,
      pageSize: 2,
      setPageSize: vi.fn(),
    },
  };
}

describe("DataTable", () => {
  it("renders loading skeleton state", () => {
    render(<DataTable table={createTable({ isLoading: true, isError: false }) as never} />);

    expect(screen.getByText("Columna")).toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders error state and retries", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    render(
      <DataTable
        table={createTable({ isLoading: false, isError: true, refetch }) as never}
      />
    );

    expect(screen.getByText("Error al cargar transacciones")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders empty state and create callback", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(
      <DataTable
        table={createTable({ isLoading: false, isError: false, total: 0 }) as never}
        onCreateTransaction={onCreate}
      />
    );

    expect(screen.getByText("Sin transacciones")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Crear primera transacción" }));
    expect(onCreate).toHaveBeenCalled();
  });

  it("renders rows and pagination when data exists", () => {
    render(
      <DataTable
        table={createTable(
          { isLoading: false, isError: false, total: 2 },
          [
            { id: 1, value: "fila-1" },
            { id: 2, value: "fila-2" },
          ]
        ) as never}
      />
    );

    expect(screen.getByText("fila-1")).toBeInTheDocument();
    expect(screen.getByText("fila-2")).toBeInTheDocument();
    expect(screen.getByText("mock-pagination")).toBeInTheDocument();
  });
});
