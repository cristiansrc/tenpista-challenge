import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppLayout } from "./app-layout";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useTheme } from "next-themes";

const logoutMock = vi.fn();
const setThemeMock = vi.fn();

vi.mock("@refinedev/core", () => ({
  useLogout: vi.fn(),
  useGetIdentity: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

vi.mock("react-router", () => ({
  Outlet: () => <div>mock-outlet</div>,
  NavLink: ({ to, onClick, className, children }: {
    to: string;
    onClick?: () => void;
    className?: string | ((args: { isActive: boolean }) => string);
    children: React.ReactNode;
  }) => (
    <a
      href={to}
      onClick={onClick}
      className={typeof className === "function" ? className({ isActive: false }) : className}
    >
      {children}
    </a>
  ),
}));

describe("AppLayout", () => {
  beforeEach(() => {
    logoutMock.mockReset();
    setThemeMock.mockReset();

    vi.mocked(useLogout).mockReturnValue({ mutate: logoutMock } as unknown as ReturnType<typeof useLogout>);
    vi.mocked(useTheme).mockReturnValue({
      theme: "dark",
      setTheme: setThemeMock,
    } as unknown as ReturnType<typeof useTheme>);
  });

  it("renders identity fallback and handles actions", async () => {
    const user = userEvent.setup();
    vi.mocked(useGetIdentity).mockReturnValue({
      data: { name: "Cristian" },
    } as unknown as ReturnType<typeof useGetIdentity>);

    render(<AppLayout />);

    expect(screen.getByText("Cristian")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("mock-outlet")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cambiar tema" }));
    expect(setThemeMock).toHaveBeenCalledWith("light");

    await user.click(screen.getByRole("button", { name: /Cerrar sesión/i }));
    expect(logoutMock).toHaveBeenCalled();
  });

  it("renders avatar when identity has avatar", () => {
    vi.mocked(useGetIdentity).mockReturnValue({
      data: { name: "Cristian", avatar: "https://avatar.test/user.png" },
    } as unknown as ReturnType<typeof useGetIdentity>);

    render(<AppLayout />);

    expect(screen.getByRole("img", { name: "Cristian" })).toHaveAttribute(
      "src",
      "https://avatar.test/user.png"
    );
  });
});
