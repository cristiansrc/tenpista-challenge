import { handleJsonResponse } from "./response";

describe("handleJsonResponse", () => {
  it("returns parsed JSON when response is OK with body", async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    await expect(handleJsonResponse(response)).resolves.toEqual({ ok: true });
  });

  it("returns null when response is OK and body is empty", async () => {
    const response = new Response("", { status: 200 });

    await expect(handleJsonResponse(response)).resolves.toBeNull();
  });

  it("throws enriched error when response is not OK", async () => {
    const response = new Response(JSON.stringify({ message: "Invalid" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

    await expect(handleJsonResponse(response)).rejects.toMatchObject({
      message: "Invalid",
      status: 400,
      response,
    });
  });
});
