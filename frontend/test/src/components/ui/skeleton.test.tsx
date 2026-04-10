import { render } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton", () => {
  it("renders default skeleton styles plus custom class", () => {
    const { container } = render(<Skeleton className="h-4 w-8" data-testid="sk" />);

    const element = container.querySelector("[data-testid='sk']");
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass("animate-pulse", "rounded-md", "bg-muted", "h-4", "w-8");
  });
});

