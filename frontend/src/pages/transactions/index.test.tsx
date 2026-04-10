import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionList from "./index";
import { useTable } from "@refinedev/react-table";

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

vi.mock("./components/transaction-filters", () => ({
  TransactionFilters: ({ onFilterChange }: { onFilterChange: typeof latestFilterHandler }) => {
    latestFilterHandler = onFilterChange;
    return <div>mock-filters</div>;
  },
}));

vi.mock("./components/transaction-form", () => ({
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
});
