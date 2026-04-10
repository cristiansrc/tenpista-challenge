import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionList from "@/pages/transactions/index";
import { useTable } from "@refinedev/react-table";
import { formatDate } from "@/lib/utils";

const setCurrentPage = vi.fn();
let latestFormOpen = false;
let latestFilterHandler: ((value: {
  tenpistaName: string;
  commerceName: string;
  fromDate: string;
  toDate: string;
}) => void) | null = null;

vi.mock("@refinedev/react-table", () => ({
  useTable: vi.fn(() => ({
    refineCore: {
      setCurrentPage,
    },
  })),
}));

vi.mock("@/components/refine-ui/data-table/data-table", () => ({
  DataTable: ({ onCreateTransaction }: { onCreateTransaction: () => void }) => (
    <button onClick={onCreateTransaction}>open-from-table</button>
  ),
}));

vi.mock("@/pages/transactions/components/transaction-filters", () => ({
  TransactionFilters: ({ onFilterChange }: { onFilterChange: typeof latestFilterHandler }) => {
    latestFilterHandler = onFilterChange;
    return <div>mock-filters</div>;
  },
}));

vi.mock("@/pages/transactions/components/transaction-form", () => ({
  TransactionForm: ({ open }: { open: boolean }) => {
    latestFormOpen = open;
    return <div>form-open:{String(open)}</div>;
  },
}));

describe("TransactionList page", () => {
  beforeEach(() => {
    latestFormOpen = false;
    latestFilterHandler = null;
    setCurrentPage.mockClear();
  });

  it("opens form from header button", async () => {
    const user = userEvent.setup();

    render(<TransactionList />);

    expect(latestFormOpen).toBe(false);
    await user.click(screen.getByRole("button", { name: /Nueva Transacción/i }));
    expect(latestFormOpen).toBe(true);
  });

  it("resets page to 1 when filters change", () => {
    render(<TransactionList />);

    expect(latestFilterHandler).not.toBeNull();
    act(() => {
      latestFilterHandler?.({
        tenpistaName: "Ana",
        commerceName: "Store",
        fromDate: "2026-04-01",
        toDate: "2026-04-09",
      });
    });

    expect(setCurrentPage).toHaveBeenCalledWith(1);
  });

  it("opens form from table action", async () => {
    const user = userEvent.setup();

    render(<TransactionList />);

    await user.click(screen.getByRole("button", { name: "open-from-table" }));
    expect(latestFormOpen).toBe(true);
  });

  it("initializes useTable for transactions resource", () => {
    render(<TransactionList />);

    expect(useTable).toHaveBeenCalled();
    const callArg = vi.mocked(useTable).mock.calls[0][0];
    expect(callArg?.refineCoreProps?.resource).toBe("transactions");
    expect(callArg?.refineCoreProps?.pagination?.mode).toBe("server");
  });

  it("builds permanent filters from filter state", () => {
    render(<TransactionList />);

    act(() => {
      latestFilterHandler?.({
        tenpistaName: "Ana",
        commerceName: "Store",
        fromDate: "2026-04-01",
        toDate: "2026-04-09",
      });
    });

    const lastCall = vi.mocked(useTable).mock.calls.at(-1)?.[0];
    const permanentFilters = lastCall?.refineCoreProps?.filters?.permanent;

    expect(permanentFilters).toEqual([
      { field: "tenpista_name", operator: "contains", value: "Ana" },
      { field: "commerce_name", operator: "contains", value: "Store" },
      { field: "transaction_date_from", operator: "eq", value: "2026-04-01" },
      { field: "transaction_date_to", operator: "eq", value: "2026-04-09" },
    ]);
  });

  it("renders table column cells correctly", () => {
    render(<TransactionList />);

    const firstCall = vi.mocked(useTable).mock.calls[0][0];
    const columns = firstCall?.columns;
    expect(columns).toBeDefined();

    const sample = {
      id: 7,
      amount: 1500,
      commerce_name: "Starbucks",
      tenpista_name: "Cristian",
      transaction_date: "2026-04-09T10:30:00.000Z",
    };

    for (const column of columns ?? []) {
      if (!column.cell) {
        continue;
      }

      render(<>{column.cell({ row: { original: sample } } as never)}</>);
    }

    expect(screen.getByText("#7")).toBeInTheDocument();
    expect(screen.getByText("$1.500")).toBeInTheDocument();
    expect(screen.getByText("Starbucks")).toBeInTheDocument();
    expect(screen.getAllByText("Cristian").length).toBeGreaterThan(0);
    expect(screen.getByText(formatDate(sample.transaction_date))).toBeInTheDocument();
  });
});

