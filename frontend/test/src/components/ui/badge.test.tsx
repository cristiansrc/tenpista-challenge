import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders content with default variant", () => {
    render(<Badge>Test Badge</Badge>);
    const badge = screen.getByText("Test Badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-primary");
  });

  it("applies variant and extra className", () => {
    render(
      <Badge variant="destructive" className="custom-class">
        Destructive
      </Badge>
    );
    const badge = screen.getByText("Destructive");
    expect(badge).toHaveClass("bg-destructive");
    expect(badge).toHaveClass("custom-class");
  });

  it("exposes outline classes from variant helper", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge).toHaveClass("text-foreground");
  });
});
