import { render, screen } from "@testing-library/react";
import App from "@/App";

const refinePropsSpy = vi.fn();

vi.mock("@refinedev/core", () => ({
  Authenticated: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Refine: (props: { children: React.ReactNode; resources: unknown; options: unknown }) => {
    refinePropsSpy(props);
    return <div data-testid="mock-refine">{props.children}</div>;
  },
}));

vi.mock("@refinedev/react-router", () => ({
  default: {},
}));

vi.mock("@/components/refine-ui/theme/theme-provider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-theme-provider">{children}</div>
  ),
}));

vi.mock("@/components/refine-ui/notification/use-notification-provider", () => ({
  useNotificationProvider: () => ({ open: vi.fn(), close: vi.fn() }),
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div>mock-toaster</div>,
}));

vi.mock("@/components/layout/app-layout", () => ({
  AppLayout: () => <div>mock-app-layout</div>,
}));

vi.mock("@/components/refine-ui/layout/error-component", () => ({
  ErrorComponent: () => <div>mock-error-page</div>,
}));

vi.mock("@/pages/login", () => ({
  default: () => <div>mock-login-page</div>,
}));

vi.mock("@/pages/transactions", () => ({
  default: () => <div>mock-transactions-page</div>,
}));

describe("App", () => {
  it("renders app shell and configures Refine resources", () => {
    render(<App />);

    expect(screen.getByTestId("mock-theme-provider")).toBeInTheDocument();
    expect(screen.getByTestId("mock-refine")).toBeInTheDocument();
    expect(screen.getByText("mock-toaster")).toBeInTheDocument();

    expect(refinePropsSpy).toHaveBeenCalled();
    const props = refinePropsSpy.mock.calls[0][0];

    expect(props.options).toMatchObject({
      syncWithLocation: true,
      warnWhenUnsavedChanges: true,
      disableTelemetry: true,
    });

    expect(props.resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "transactions",
          list: "/transactions",
        }),
      ])
    );
  });
});

