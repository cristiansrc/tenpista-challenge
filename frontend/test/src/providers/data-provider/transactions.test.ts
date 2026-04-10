import { transactionsDataProvider } from "@/providers/data-provider/transactions";
import * as authModule from "@/providers/data-provider/shared/auth";
import * as responseModule from "@/providers/data-provider/shared/response";

vi.mock("@/providers/data-provider/shared/auth", () => ({
  getJsonAuthHeaders: vi.fn(() => ({ "Content-Type": "application/json" })),
}));

vi.mock("@/providers/data-provider/shared/response", () => ({
  handleJsonResponse: vi.fn(),
}));

describe("transactionsDataProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  });

  it("getApiUrl returns configured API URL", () => {
    expect(transactionsDataProvider.getApiUrl()).toBeTruthy();
  });

  it("getList builds query with pagination and filters", async () => {
    vi.mocked(responseModule.handleJsonResponse).mockResolvedValue({
      content: [{ id: 1 }],
      total_elements: 1,
    });

    const result = await transactionsDataProvider.getList({
      resource: "transactions",
      pagination: { currentPage: 2, pageSize: 20, mode: "server" },
      filters: [
        { field: "tenpista_name", operator: "contains", value: "Juan" },
        { field: "commerce_name", operator: "contains", value: "Market" },
        { field: "transaction_date_from", operator: "eq", value: "2026-04-01" },
        { field: "transaction_date_to", operator: "eq", value: "2026-04-09" },
      ],
      sorters: [],
      meta: {},
    });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const calledUrl = String(fetchCall[0]);

    expect(calledUrl).toContain("/transactions?");
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).toContain("size=20");
    expect(calledUrl).toContain("tenpistaName=Juan");
    expect(calledUrl).toContain("commerceName=Market");
    expect(calledUrl).toContain("fromDate=2026-04-01T00%3A00%3A00Z");
    expect(calledUrl).toContain("toDate=2026-04-09T23%3A59%3A59.999Z");
    expect(authModule.getJsonAuthHeaders).toHaveBeenCalled();

    expect(result).toEqual({ data: [{ id: 1 }], total: 1 });
  });

  it("getList uses default pagination when params are not provided", async () => {
    vi.mocked(responseModule.handleJsonResponse).mockResolvedValue({
      content: [],
      total_elements: 0,
    });

    const result = await transactionsDataProvider.getList({
      resource: "transactions",
      pagination: undefined,
      filters: [],
      sorters: [],
      meta: {},
    });

    const calledUrl = String(vi.mocked(fetch).mock.calls[0][0]);
    expect(calledUrl).toContain("page=0");
    expect(calledUrl).toContain("size=10");
    expect(calledUrl).not.toContain("tenpistaName=");
    expect(calledUrl).not.toContain("commerceName=");
    expect(calledUrl).not.toContain("fromDate=");
    expect(calledUrl).not.toContain("toDate=");
    expect(result).toEqual({ data: [], total: 0 });
  });

  it("create posts body and returns parsed data", async () => {
    vi.mocked(responseModule.handleJsonResponse).mockResolvedValue({ id: 10 });

    const result = await transactionsDataProvider.create({
      resource: "transactions",
      variables: { amount: 1000 },
    });

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options?.method).toBe("POST");
    expect(options?.body).toBe(JSON.stringify({ amount: 1000 }));
    expect(result).toEqual({ data: { id: 10 } });
  });

  it("getOne fetches by id", async () => {
    vi.mocked(responseModule.handleJsonResponse).mockResolvedValue({ id: 3 });

    const result = await transactionsDataProvider.getOne({ resource: "transactions", id: 3 });

    expect(String(vi.mocked(fetch).mock.calls[0][0])).toContain("/transactions/3");
    expect(result).toEqual({ data: { id: 3 } });
  });

  it("getMany fetches each id and returns aggregated data", async () => {
    vi.mocked(responseModule.handleJsonResponse)
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 2 });

    const result = await transactionsDataProvider.getMany({
      resource: "transactions",
      ids: [1, 2],
    });

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: [{ id: 1 }, { id: 2 }] });
  });

  it("update throws unsupported error", async () => {
    await expect(
      transactionsDataProvider.update({ resource: "transactions", id: 1, variables: {} })
    ).rejects.toThrow("Actualizar transacciones no está soportado");
  });

  it("deleteOne throws unsupported error", async () => {
    await expect(
      transactionsDataProvider.deleteOne({ resource: "transactions", id: 1 })
    ).rejects.toThrow("Eliminar transacciones no está soportado");
  });
});

