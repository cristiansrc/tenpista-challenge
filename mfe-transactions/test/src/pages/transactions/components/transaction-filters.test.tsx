import { act, fireEvent, render, screen } from "@testing-library/react";
import { TransactionFilters } from "@/pages/transactions/components/transaction-filters";

describe("TransactionFilters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("emits filter changes with debounce", () => {
    const onFilterChange = vi.fn();

    render(<TransactionFilters onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByLabelText("Filtrar por nombre de Tenpista"), {
      target: { value: "Juan" },
    });

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onFilterChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({
      tenpistaName: "Juan",
      commerceName: "",
      fromDate: "",
      toDate: "",
    });
  });

  it("clears all filters with clear button", () => {
    const onFilterChange = vi.fn();

    render(<TransactionFilters onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByLabelText("Filtrar por nombre de Tenpista"), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText("Filtrar por comercio"), {
      target: { value: "Market" },
    });
    fireEvent.change(screen.getByLabelText("Filtrar desde fecha"), {
      target: { value: "2026-04-01" },
    });
    fireEvent.change(screen.getByLabelText("Filtrar hasta fecha"), {
      target: { value: "2026-04-09" },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.click(screen.getByRole("button", { name: "Limpiar todos los filtros" }));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onFilterChange).toHaveBeenLastCalledWith({
      tenpistaName: "",
      commerceName: "",
      fromDate: "",
      toDate: "",
    });
  });

  it("clears a single text filter using its clear button", () => {
    const onFilterChange = vi.fn();

    render(<TransactionFilters onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByLabelText("Filtrar por nombre de Tenpista"), {
      target: { value: "Pedro" },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtro" }));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onFilterChange).toHaveBeenLastCalledWith({
      tenpistaName: "",
      commerceName: "",
      fromDate: "",
      toDate: "",
    });
  });

  it("applies min and max constraints between date fields", () => {
    const onFilterChange = vi.fn();

    render(<TransactionFilters onFilterChange={onFilterChange} />);

    const fromDate = screen.getByLabelText("Filtrar desde fecha") as HTMLInputElement;
    const toDate = screen.getByLabelText("Filtrar hasta fecha") as HTMLInputElement;

    fireEvent.change(fromDate, { target: { value: "2026-04-01" } });
    expect(toDate.min).toBe("2026-04-01");

    fireEvent.change(toDate, { target: { value: "2026-04-09" } });
    expect(fromDate.max).toBe("2026-04-09");
  });
});

