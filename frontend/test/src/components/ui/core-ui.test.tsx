import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

describe("Core UI Components", () => {
  describe("Button", () => {
    it("renders as button by default", () => {
      render(<Button>Click me</Button>);
      const btn = screen.getByRole("button");
      expect(btn.tagName).toBe("BUTTON");
      expect(btn).toHaveClass("bg-primary");
    });

    it("renders with secondary variant and sm size", () => {
      render(<Button variant="secondary" size="sm">Small secondary</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("bg-secondary");
      expect(btn).toHaveClass("h-9");
    });

    it("renders as child when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link button</a>
        </Button>
      );
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveClass("bg-primary");
    });
  });

  describe("Separator", () => {
    it("renders horizontal separator by default", () => {
      render(<Separator data-testid="sep" />);
      const sep = screen.getByTestId("sep");
      expect(sep).toHaveClass("h-[1px] w-full");
    });

    it("renders vertical separator", () => {
      render(<Separator orientation="vertical" data-testid="sep-v" />);
      const sep = screen.getByTestId("sep-v");
      expect(sep).toHaveClass("h-full w-[1px]");
    });
  });

  describe("Card", () => {
    it("renders all card subcomponents", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(screen.getByText("Footer")).toBeInTheDocument();
    });
  });
});
