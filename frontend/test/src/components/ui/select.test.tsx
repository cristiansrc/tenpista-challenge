import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

describe("Select primitives", () => {
  it("renders trigger and content items when open", () => {
    render(
      <Select open={true}>
        <SelectTrigger aria-label="Select trigger">
          <SelectValue placeholder="Select item" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="item-1">Item 1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    expect(screen.getByLabelText("Select trigger")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });
});
