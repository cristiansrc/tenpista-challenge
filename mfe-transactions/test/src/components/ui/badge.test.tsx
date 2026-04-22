import { render, screen } from "@testing-library/react";
import { Badge, badgeVariants } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders content with default variant", () => {
    render(<Badge>Nuevo</Badge>);

    const badge = screen.getByText("Nuevo");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-primary");
  });

  it("applies variant and extra className", () => {
    render(
      <Badge variant="secondary" className="custom-class">
        Secundario
      </Badge>
    );

    const badge = screen.getByText("Secundario");
    expect(badge.className).toContain("bg-secondary");
    expect(badge.className).toContain("custom-class");
  });

  it("exposes outline classes from variant helper", () => {
    expect(badgeVariants({ variant: "outline" })).toContain("text-foreground");
  });
});
