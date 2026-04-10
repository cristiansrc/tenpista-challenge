import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionForm } from "./transaction-form";
import { useCreate } from "@refinedev/core";

vi.mock("@refinedev/core", () => ({
  useCreate: vi.fn(),
}));

describe("TransactionForm", () => {
  it("submits transaction and sends ISO date", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();

    vi.mocked(useCreate).mockReturnValue({
      mutate,
      mutation: { isPending: false },
    } as unknown as ReturnType<typeof useCreate>);

    render(<TransactionForm open={true} onClose={vi.fn()} />);

    await user.type(screen.getByLabelText("Monto (CLP)"), "1500");
    await user.type(screen.getByLabelText("Comercio"), "Starbucks");
    await user.type(screen.getByLabelText("Nombre Tenpista"), "Cristian");
    await user.type(screen.getByLabelText("Fecha y hora"), "2026-04-09T10:30");

    await user.click(screen.getByRole("button", { name: "Registrar" }));

    const expectedIso = new Date("2026-04-09T10:30").toISOString();

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toMatchObject({
      resource: "transactions",
      values: {
        amount: 1500,
        commerce_name: "Starbucks",
        tenpista_name: "Cristian",
        transaction_date: expectedIso,
      },
    });
  });

  it("shows loading state when mutation is pending", () => {
    vi.mocked(useCreate).mockReturnValue({
      mutate: vi.fn(),
      mutation: { isPending: true },
    } as unknown as ReturnType<typeof useCreate>);

    render(<TransactionForm open={true} onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Guardando/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });
});
