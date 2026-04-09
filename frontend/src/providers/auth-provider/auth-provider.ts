import type { AuthProvider } from "@refinedev/core";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/v1/api";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            name: "LoginError",
            message: error.message ?? "Credenciales inválidas",
          },
        };
      }

      const tokenData = await response.json();

      Cookies.set(
        "auth",
        JSON.stringify({
          access_token: tokenData.access_token,
          token_type: tokenData.token_type,
          username,
        }),
        { expires: 1, path: "/" }
      );

      return { success: true, redirectTo: "/" };
    } catch {
      return {
        success: false,
        error: { name: "NetworkError", message: "No se pudo conectar al servidor" },
      };
    }
  },

  logout: async () => {
    Cookies.remove("auth", { path: "/" });
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const auth = Cookies.get("auth");
    if (!auth) return { authenticated: false, logout: true, redirectTo: "/login" };
    try {
      const parsed = JSON.parse(auth);
      if (!parsed.access_token) {
        Cookies.remove("auth", { path: "/" });
        return { authenticated: false, logout: true, redirectTo: "/login" };
      }
      return { authenticated: true };
    } catch {
      Cookies.remove("auth", { path: "/" });
      return { authenticated: false, logout: true, redirectTo: "/login" };
    }
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    const auth = Cookies.get("auth");
    if (!auth) return null;
    try {
      const parsed = JSON.parse(auth);
      return {
        id: parsed.username,
        name: parsed.username,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.username)}&background=random&color=fff`,
      };
    } catch {
      return null;
    }
  },

  onError: async (error) => {
    if (error?.status === 401 || error?.response?.status === 401) {
      Cookies.remove("auth", { path: "/" });
      return { logout: true, redirectTo: "/login" };
    }
    return { error };
  },
};
