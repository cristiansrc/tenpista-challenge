import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DataTablePagination } from "@/components/refine-ui/data-table/data-table-pagination";

describe("DataTablePagination", () => {
  const mockProps = {
    currentPage: 2,
    pageCount: 5,
    setCurrentPage: vi.fn(),
    pageSize: 10,
    setPageSize: vi.fn(),
    total: 50,
  };

  it("renders totals and handles paging actions", () => {
    render(<DataTablePagination {...mockProps} />);

    expect(screen.getByText(/50 transacciones en total/i)).toBeInTheDocument();
    expect(screen.getByText(/Página 2 de 5/i)).toBeInTheDocument();

    const nextBtn = screen.getByLabelText(/Página siguiente/i);
    fireEvent.click(nextBtn);
    expect(mockProps.setCurrentPage).toHaveBeenCalledWith(3);

    const prevBtn = screen.getByLabelText(/Página anterior/i);
    fireEvent.click(prevBtn);
    expect(mockProps.setCurrentPage).toHaveBeenCalledWith(1);
  });
});
