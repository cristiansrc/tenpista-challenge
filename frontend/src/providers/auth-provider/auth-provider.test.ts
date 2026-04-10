import Cookies from "js-cookie";
import { authProvider } from "./auth-provider";

vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe("authProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("login stores auth cookie and redirects on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: "token",
          token_type: "Bearer",
        }),
      })
    );

    const result = await authProvider.login({
      username: "admin@tenpo.cl",
      password: "Tenpista2026!",
    });

    expect(result).toEqual({ success: true, redirectTo: "/" });
    expect(Cookies.set).toHaveBeenCalledOnce();
  });

  it("login returns LoginError on invalid credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ message: "No autorizado" }),
      })
    );

    const result = await authProvider.login({ username: "u", password: "p" });

    expect(result.success).toBe(false);
    expect(result.error?.name).toBe("LoginError");
    expect(result.error?.message).toBe("No autorizado");
  });

  it("login returns NetworkError when request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const result = await authProvider.login({ username: "u", password: "p" });

    expect(result.success).toBe(false);
    expect(result.error?.name).toBe("NetworkError");
  });

  it("logout removes auth cookie", async () => {
    await expect(authProvider.logout()).resolves.toEqual({
      success: true,
      redirectTo: "/login",
    });
    expect(Cookies.remove).toHaveBeenCalledWith("auth", { path: "/" });
  });

  it("check returns authenticated when access token exists", async () => {
    vi.mocked(Cookies.get).mockReturnValue(
      JSON.stringify({ access_token: "token", username: "admin@tenpo.cl" })
    );

    await expect(authProvider.check()).resolves.toEqual({ authenticated: true });
  });

  it("check logs out when cookie is missing", async () => {
    vi.mocked(Cookies.get).mockReturnValue(undefined);

    await expect(authProvider.check()).resolves.toEqual({
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    });
  });

  it("check logs out when access token is missing in cookie payload", async () => {
    vi.mocked(Cookies.get).mockReturnValue(JSON.stringify({ username: "admin@tenpo.cl" }));

    await expect(authProvider.check()).resolves.toEqual({
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    });
    expect(Cookies.remove).toHaveBeenCalledWith("auth", { path: "/" });
  });

  it("check logs out when cookie is invalid", async () => {
    vi.mocked(Cookies.get).mockReturnValue("{bad json");

    await expect(authProvider.check()).resolves.toEqual({
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    });
    expect(Cookies.remove).toHaveBeenCalledWith("auth", { path: "/" });
  });

  it("getIdentity returns parsed identity", async () => {
    vi.mocked(Cookies.get).mockReturnValue(
      JSON.stringify({ access_token: "token", username: "admin@tenpo.cl" })
    );

    const identity = await authProvider.getIdentity?.();
    expect(identity).toMatchObject({
      id: "admin@tenpo.cl",
      name: "admin@tenpo.cl",
    });
    expect(identity?.avatar).toContain("ui-avatars.com");
  });

  it("getIdentity returns null when cookie is missing", async () => {
    vi.mocked(Cookies.get).mockReturnValue(undefined);

    await expect(authProvider.getIdentity?.()).resolves.toBeNull();
  });

  it("getIdentity returns null when cookie JSON is malformed", async () => {
    vi.mocked(Cookies.get).mockReturnValue("{bad json");

    await expect(authProvider.getIdentity?.()).resolves.toBeNull();
  });

  it("getPermissions returns null", async () => {
    await expect(authProvider.getPermissions?.()).resolves.toBeNull();
  });

  it("onError forces logout on 401", async () => {
    await expect(authProvider.onError?.({ status: 401 })).resolves.toEqual({
      logout: true,
      redirectTo: "/login",
    });
    expect(Cookies.remove).toHaveBeenCalledWith("auth", { path: "/" });
  });

  it("onError forces logout when nested response status is 401", async () => {
    await expect(authProvider.onError?.({ response: { status: 401 } })).resolves.toEqual({
      logout: true,
      redirectTo: "/login",
    });
  });

  it("onError returns original error for non-401", async () => {
    const error = { status: 500, message: "boom" };
    await expect(authProvider.onError?.(error)).resolves.toEqual({ error });
  });
});
