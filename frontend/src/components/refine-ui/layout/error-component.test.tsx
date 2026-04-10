import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorComponent } from "./error-component";
import { useGo } from "@refinedev/core";

const goMock = vi.fn();

vi.mock("@refinedev/core", () => ({
  useGo: vi.fn(),
}));

describe("ErrorComponent", () => {
  it("navigates to transactions when button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(useGo).mockReturnValue(goMock);

    render(<ErrorComponent />);

    await user.click(screen.getByRole("button", { name: "Volver al inicio" }));

    expect(goMock).toHaveBeenCalledWith({ to: "/transactions", type: "push" });
  });
});
