import { render, screen } from "@testing-library/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

describe("Select primitives", () => {
  it("renders trigger and content items when open", () => {
    render(
      <Select defaultValue="10" open>
        <SelectTrigger aria-label="rows-select">
          <SelectValue placeholder="rows" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Filas</SelectLabel>
            <SelectItem value="10">10</SelectItem>
            <SelectSeparator />
            <SelectItem value="20">20</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    expect(screen.getByLabelText("rows-select")).toBeInTheDocument();
    expect(screen.getByText("Filas")).toBeInTheDocument();
    expect(screen.getAllByText("10").length).toBeGreaterThan(0);
    expect(screen.getByText("20")).toBeInTheDocument();
  });
});

