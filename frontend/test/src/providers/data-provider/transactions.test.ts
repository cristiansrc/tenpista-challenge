import { describe, it, expect, vi, beforeEach } from "vitest";
import { transactionsDataProvider } from "@/providers/data-provider/transactions";
import { getJsonAuthHeaders } from "@/providers/data-provider/shared/auth";
import { handleJsonResponse } from "@/providers/data-provider/shared/response";

vi.mock("@/providers/data-provider/shared/auth", () => ({
  getJsonAuthHeaders: vi.fn(() => ({ Authorization: "Bearer token" })),
}));

vi.mock("@/providers/data-provider/shared/response", () => ({
  handleJsonResponse: vi.fn(),
}));

const globalFetch = global.fetch;

describe("transactionsDataProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterAll(() => {
    global.fetch = globalFetch;
  });

  it("getApiUrl returns configured API URL", () => {
    expect(transactionsDataProvider.getApiUrl()).toContain("/v1/api");
  });

  describe("getList", () => {
    it("builds query with pagination and filters", async () => {
      const mockData = { content: [], total_elements: 0 };
      (handleJsonResponse as any).mockResolvedValueOnce(mockData);

      await transactionsDataProvider.getList({
        resource: "transactions",
        pagination: { currentPage: 2, pageSize: 20 },
        filters: [
          { field: "tenpista_name", operator: "contains", value: "Juan" },
          { field: "commerce_name", operator: "contains", value: "Starbucks" },
          { field: "transaction_date_from", operator: "gte", value: "2026-01-01" },
          { field: "transaction_date_to", operator: "lte", value: "2026-01-31" },
        ],
      });

      const fetchUrl = (global.fetch as any).mock.calls[0][0];
      const url = new URL(fetchUrl);

      expect(url.searchParams.get("page")).toBe("1");
      expect(url.searchParams.get("size")).toBe("20");
      expect(url.searchParams.get("tenpistaName")).toBe("Juan");
      expect(url.searchParams.get("commerceName")).toBe("Starbucks");
      expect(url.searchParams.get("fromDate")).toBe("2026-01-01T00:00:00Z");
      expect(url.searchParams.get("toDate")).toBe("2026-01-31T23:59:59.999Z");
    });

    it("uses default pagination when params are not provided", async () => {
      (handleJsonResponse as any).mockResolvedValueOnce({
        content: [],
        total_elements: 0,
      });

      await transactionsDataProvider.getList({ resource: "transactions" });

      const fetchUrl = (global.fetch as any).mock.calls[0][0];
      const url = new URL(fetchUrl);
      expect(url.searchParams.get("page")).toBe("0");
      expect(url.searchParams.get("size")).toBe("10");
    });
  });

  describe("create", () => {
    it("posts body and returns parsed data", async () => {
      const variables = { amount: 100 };
      const mockData = { id: 1, ...variables };
      (handleJsonResponse as any).mockResolvedValueOnce(mockData);

      const result = await transactionsDataProvider.create({
        resource: "transactions",
        variables,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/transactions"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(variables),
          headers: expect.objectContaining({ Authorization: "Bearer token" }),
        })
      );
      expect(result.data).toEqual(mockData);
    });
  });

  describe("getOne", () => {
    it("fetches by id", async () => {
      const mockData = { id: "123" };
      (handleJsonResponse as any).mockResolvedValueOnce(mockData);

      const result = await transactionsDataProvider.getOne({
        resource: "transactions",
        id: "123",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/transactions/123"),
        expect.any(Object)
      );
      expect(result.data).toEqual(mockData);
    });
  });

  describe("getMany", () => {
    it("fetches each id and returns aggregated data", async () => {
      (global.fetch as any).mockResolvedValue({ ok: true });
      (handleJsonResponse as any).mockResolvedValue({ id: "any" });

      const result = await transactionsDataProvider.getMany?.({
        resource: "transactions",
        ids: ["1", "2"],
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result?.data).toHaveLength(2);
    });
  });

  describe("unsupported methods", () => {
    it("update throws unsupported error", async () => {
      await expect(
        transactionsDataProvider.update({ resource: "tx", id: 1, variables: {} })
      ).rejects.toThrow();
    });

    it("deleteOne throws unsupported error", async () => {
      await expect(
        transactionsDataProvider.deleteOne({ resource: "tx", id: 1 })
      ).rejects.toThrow();
    });
  });
});
