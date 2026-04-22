import { describe, it, expect, vi, beforeEach } from "vitest";
import { authProvider } from "@/providers/auth-provider/auth-provider";
import Cookies from "js-cookie";

vi.mock("js-cookie", () => ({
  default: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  },
}));

const globalFetch = global.fetch;

describe("authProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterAll(() => {
    global.fetch = globalFetch;
  });

  describe("login", () => {
    it("stores auth cookie and redirects on success", async () => {
      const mockToken = { access_token: "fake-token", token_type: "Bearer" };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockToken,
      });

      const result = await authProvider.login({
        username: "admin@tenpo.cl",
        password: "password",
      });

      expect(result.success).toBe(true);
      expect(result.redirectTo).toBe("/");
      expect(Cookies.set).toHaveBeenCalledWith(
        "auth",
        JSON.stringify({
          access_token: "fake-token",
          token_type: "Bearer",
          username: "admin@tenpo.cl",
        }),
        { expires: 1, path: "/" }
      );
    });

    it("returns LoginError on invalid credentials", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Credenciales inválidas" }),
      });

      const result = await authProvider.login({
        username: "wrong@tenpo.cl",
        password: "wrong",
      });

      expect(result.success).toBe(false);
      expect(result.error?.name).toBe("LoginError");
      expect(result.error?.message).toBe("Credenciales inválidas");
    });

    it("returns NetworkError when request throws", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network Error"));

      const result = await authProvider.login({
        username: "admin@tenpo.cl",
        password: "password",
      });

      expect(result.success).toBe(false);
      expect(result.error?.name).toBe("NetworkError");
    });
  });

  describe("logout", () => {
    it("removes auth cookie", async () => {
      const result = await authProvider.logout({});

      expect(result.success).toBe(true);
      expect(result.redirectTo).toBe("/login");
      expect(Cookies.remove).toHaveBeenCalledWith("auth", { path: "/" });
    });
  });

  describe("check", () => {
    it("returns authenticated when access token exists", async () => {
      (Cookies.get as any).mockReturnValueOnce(
        JSON.stringify({ access_token: "token" })
      );

      const result = await authProvider.check({});

      expect(result.authenticated).toBe(true);
    });

    it("logs out when cookie is missing", async () => {
      (Cookies.get as any).mockReturnValueOnce(undefined);

      const result = await authProvider.check({});

      expect(result.authenticated).toBe(false);
      expect(result.logout).toBe(true);
      expect(result.redirectTo).toBe("/login");
    });

    it("logs out when access token is missing in cookie payload", async () => {
      (Cookies.get as any).mockReturnValueOnce(JSON.stringify({}));

      const result = await authProvider.check({});

      expect(result.authenticated).toBe(false);
      expect(Cookies.remove).toHaveBeenCalledWith("auth", { path: "/" });
    });

    it("logs out when cookie is invalid", async () => {
      (Cookies.get as any).mockReturnValueOnce("invalid-json");

      const result = await authProvider.check({});

      expect(result.authenticated).toBe(false);
      expect(Cookies.remove).toHaveBeenCalledWith("auth", { path: "/" });
    });
  });

  describe("getIdentity", () => {
    it("returns parsed identity", async () => {
      (Cookies.get as any).mockReturnValueOnce(
        JSON.stringify({ username: "admin@tenpo.cl" })
      );

      const result = await authProvider.getIdentity?.({});

      expect(result).toEqual({
        id: "admin@tenpo.cl",
        name: "admin@tenpo.cl",
        avatar: expect.stringContaining("ui-avatars.com"),
      });
    });

    it("returns null when cookie is missing", async () => {
      (Cookies.get as any).mockReturnValueOnce(undefined);

      const result = await authProvider.getIdentity?.({});

      expect(result).toBeNull();
    });

    it("returns null when cookie JSON is malformed", async () => {
      (Cookies.get as any).mockReturnValueOnce("invalid-json");

      const result = await authProvider.getIdentity?.({});

      expect(result).toBeNull();
    });
  });

  describe("getPermissions", () => {
    it("returns null", async () => {
      const result = await authProvider.getPermissions?.({});
      expect(result).toBeNull();
    });
  });

  describe("onError", () => {
    it("forces logout on 401", async () => {
      const result = await authProvider.onError?.({ status: 401 });

      expect(result?.logout).toBe(true);
      expect(result?.redirectTo).toBe("/login");
      expect(Cookies.remove).toHaveBeenCalledWith("auth", { path: "/" });
    });

    it("forces logout when nested response status is 401", async () => {
      const result = await authProvider.onError?.({ response: { status: 401 } });

      expect(result?.logout).toBe(true);
      expect(Cookies.remove).toHaveBeenCalled();
    });

    it("returns original error for non-401", async () => {
      const error = { status: 500 };
      const result = await authProvider.onError?.(error);

      expect(result).toEqual({ error });
      expect(Cookies.remove).not.toHaveBeenCalled();
    });
  });
});
