import { describe, it, expect, vi } from "vitest";
import { getAccessToken, getJsonAuthHeaders } from "@/providers/data-provider/shared/auth";
import Cookies from "js-cookie";

vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("shared auth", () => {
  describe("getAccessToken", () => {
    it("returns token when cookie is valid", () => {
      (Cookies.get as any).mockReturnValue(JSON.stringify({ access_token: "abc" }));
      expect(getAccessToken()).toBe("abc");
    });

    it("returns undefined when cookie is missing", () => {
      (Cookies.get as any).mockReturnValue(undefined);
      expect(getAccessToken()).toBeUndefined();
    });

    it("returns undefined for malformed cookie JSON", () => {
      (Cookies.get as any).mockReturnValue("invalid");
      expect(getAccessToken()).toBeUndefined();
    });
  });

  describe("getJsonAuthHeaders", () => {
    it("includes authorization when token exists", () => {
      (Cookies.get as any).mockReturnValue(JSON.stringify({ access_token: "token" }));
      const headers = getJsonAuthHeaders() as Record<string, string>;
      expect(headers["Authorization"]).toBe("Bearer token");
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("only sets content type when token is missing", () => {
      (Cookies.get as any).mockReturnValue(undefined);
      const headers = getJsonAuthHeaders() as Record<string, string>;
      expect(headers["Authorization"]).toBeUndefined();
      expect(headers["Content-Type"]).toBe("application/json");
    });
  });
});
