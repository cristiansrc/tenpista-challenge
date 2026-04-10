import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInForm } from "./sign-in-form";
import { useLogin } from "@refinedev/core";

vi.mock("@refinedev/core", () => ({
  useLogin: vi.fn(),
}));

describe("SignInForm", () => {
  it("submits credentials with useLogin mutate", async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();
    vi.mocked(useLogin).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useLogin>);

    render(<SignInForm />);

    await user.type(screen.getByLabelText("Email"), "admin@tenpo.cl");
    await user.type(screen.getByLabelText("Contraseña"), "Tenpista2026!");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(mutate).toHaveBeenCalledWith({
      username: "admin@tenpo.cl",
      password: "Tenpista2026!",
    });
  });

  it("shows pending state when login is in progress", () => {
    vi.mocked(useLogin).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useLogin>);

    render(<SignInForm />);

    expect(screen.getByRole("button", { name: /Iniciando sesión/i })).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Contraseña")).toBeDisabled();
  });
});
