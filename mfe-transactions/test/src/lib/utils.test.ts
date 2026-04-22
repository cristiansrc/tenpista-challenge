import { cn, formatCurrency, formatDate } from "@/lib/utils";

describe("utils", () => {
  it("cn merges class names with tailwind precedence", () => {
    expect(cn("px-2", "px-4", "text-sm")).toBe("px-4 text-sm");
  });

  it("formatCurrency formats CLP values", () => {
    const expected = new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(12500);

    expect(formatCurrency(12500)).toBe(expected);
  });

  it("formatDate uses es-CL date-time format", () => {
    const iso = "2026-04-09T15:30:00Z";
    const expected = new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

    expect(formatDate(iso)).toBe(expected);
  });
});

