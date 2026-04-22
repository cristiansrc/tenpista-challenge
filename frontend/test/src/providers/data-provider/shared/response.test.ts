import { describe, it, expect } from "vitest";
import { handleJsonResponse } from "@/providers/data-provider/shared/response";

describe("handleJsonResponse", () => {
  it("returns parsed JSON when response is OK with body", async () => {
    const mockResponse = {
      ok: true,
      text: async () => JSON.stringify({ data: "ok" }),
    } as Response;

    const result = await handleJsonResponse(mockResponse);
    expect(result).toEqual({ data: "ok" });
  });

  it("returns null when response is OK and body is empty", async () => {
    const mockResponse = {
      ok: true,
      text: async () => "",
    } as Response;

    const result = await handleJsonResponse(mockResponse);
    expect(result).toBeNull();
  });

  it("throws enriched error when response is not OK", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      json: async () => ({ message: "Bad Request" }),
    } as Response;

    await expect(handleJsonResponse(mockResponse)).rejects.toMatchObject({
      message: "Bad Request",
      status: 400,
      response: mockResponse,
    });
  });
});
