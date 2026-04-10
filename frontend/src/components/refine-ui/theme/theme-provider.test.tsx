import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./theme-provider";

const nextThemesProviderSpy = vi.fn();

vi.mock("next-themes", () => ({
  ThemeProvider: ({ children, ...props }: { children: React.ReactNode }) => {
    nextThemesProviderSpy(props);
    return <div data-testid="mock-next-theme-provider">{children}</div>;
  },
}));

describe("ThemeProvider wrapper", () => {
  it("passes expected defaults and children to next-themes provider", () => {
    render(
      <ThemeProvider storageKey="custom-key">
        <span>theme-child</span>
      </ThemeProvider>
    );

    expect(screen.getByTestId("mock-next-theme-provider")).toBeInTheDocument();
    expect(screen.getByText("theme-child")).toBeInTheDocument();

    expect(nextThemesProviderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: "class",
        defaultTheme: "system",
        enableSystem: true,
        disableTransitionOnChange: true,
        storageKey: "custom-key",
      })
    );
  });
});
