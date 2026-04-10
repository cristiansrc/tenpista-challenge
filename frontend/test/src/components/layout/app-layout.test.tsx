import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppLayout } from "@/components/layout/app-layout";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useTheme } from "next-themes";

const logoutMock = vi.fn();
const setThemeMock = vi.fn();
let navIsActive = false;

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
      className={typeof className === "function" ? className({ isActive: navIsActive }) : className}
    >
      {children}
    </a>
  ),
}));

describe("AppLayout", () => {
  beforeEach(() => {
    logoutMock.mockReset();
    setThemeMock.mockReset();
    navIsActive = false;

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

  it("opens mobile navigation menu", async () => {
    vi.mocked(useGetIdentity).mockReturnValue({
      data: { name: "Cristian" },
    } as unknown as ReturnType<typeof useGetIdentity>);

    render(<AppLayout />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menú de navegación" }));

    expect(screen.getByText("Menú de navegación")).toBeInTheDocument();
  });

  it("applies active navigation classes", () => {
    navIsActive = true;
    vi.mocked(useGetIdentity).mockReturnValue({
      data: { name: "Cristian" },
    } as unknown as ReturnType<typeof useGetIdentity>);

    render(<AppLayout />);

    const transactionLink = screen.getAllByRole("link", { name: "Transacciones" })[0];
    expect(transactionLink.className).toContain("bg-sidebar-accent");
  });

  it("toggles to dark theme when current theme is light", async () => {
    const user = userEvent.setup();
    vi.mocked(useTheme).mockReturnValue({
      theme: "light",
      setTheme: setThemeMock,
    } as unknown as ReturnType<typeof useTheme>);
    vi.mocked(useGetIdentity).mockReturnValue({
      data: { name: "Cristian" },
    } as unknown as ReturnType<typeof useGetIdentity>);

    render(<AppLayout />);

    await user.click(screen.getByRole("button", { name: "Cambiar tema" }));
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });

});

