import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names with tailwind precedence", () => {
      expect(cn("px-2 py-2", "px-4")).toBe("py-2 px-4");
    });
  });

  describe("formatCurrency", () => {
    it("formats CLP values", () => {
      const result = formatCurrency(5000).replace(/\s/g, " ");
      expect(result).toContain("$");
      expect(result).toContain("5.000");
    });
  });

  describe("formatDate", () => {
    it("uses es-CL date-time format", () => {
      const date = "2026-04-09T10:30:00Z";
      const result = formatDate(date);
      // Validamos formato parcial dia-mes-año o dia/mes/año
      expect(result).toMatch(/\d{2}[/-]\d{2}[/-]2026/);
    });
  });
});
