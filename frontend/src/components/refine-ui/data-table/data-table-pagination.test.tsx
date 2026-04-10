import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTablePagination } from "./data-table-pagination";

vi.mock("@/components/ui/select", () => ({
  Select: ({ onValueChange, children }: { onValueChange: (value: string) => void; children: React.ReactNode }) => (
    <div>
      <button onClick={() => onValueChange("20")}>mock-change-size</button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <div>{placeholder}</div>,
}));

describe("DataTablePagination", () => {
  it("renders totals and handles paging actions", async () => {
    const user = userEvent.setup();
    const setCurrentPage = vi.fn();
    const setPageSize = vi.fn();

    render(
      <DataTablePagination
        currentPage={2}
        pageCount={4}
        setCurrentPage={setCurrentPage}
        pageSize={10}
        setPageSize={setPageSize}
        total={125}
      />
    );

    expect(screen.getByText("125 transacciones en total")).toBeInTheDocument();
    expect(screen.getByText("Página 2 de 4")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Primera página" }));
    await user.click(screen.getByRole("button", { name: "Página anterior" }));
    await user.click(screen.getByRole("button", { name: "Página siguiente" }));
    await user.click(screen.getByRole("button", { name: "Última página" }));
    await user.click(screen.getByRole("button", { name: "mock-change-size" }));

    expect(setCurrentPage).toHaveBeenCalledWith(1);
    expect(setCurrentPage).toHaveBeenCalledWith(4);
    expect(setCurrentPage).toHaveBeenCalledWith(1);
    expect(setCurrentPage).toHaveBeenCalledWith(3);
    expect(setPageSize).toHaveBeenCalledWith(20);
  });
});
