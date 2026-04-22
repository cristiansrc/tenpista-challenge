import Cookies from "js-cookie";

export function getAccessToken(): string | undefined {
  const auth = Cookies.get("auth");
  if (!auth) return undefined;
  try {
    const parsed = JSON.parse(auth) as { access_token?: unknown };
    return typeof parsed.access_token === "string" ? parsed.access_token : undefined;
  } catch {
    return undefined;
  }
}

export function getJsonAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}
