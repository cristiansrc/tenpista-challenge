import Cookies from "js-cookie";
import { getAccessToken, getJsonAuthHeaders } from "@/providers/data-provider/shared/auth";

vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("shared auth", () => {
  it("getAccessToken returns token when cookie is valid", () => {
    vi.mocked(Cookies.get).mockReturnValue(
      JSON.stringify({ access_token: "token-123" })
    );

    expect(getAccessToken()).toBe("token-123");
  });

  it("getAccessToken returns undefined when cookie is missing", () => {
    vi.mocked(Cookies.get).mockReturnValue(undefined);

    expect(getAccessToken()).toBeUndefined();
  });

  it("getAccessToken returns undefined for malformed cookie JSON", () => {
    vi.mocked(Cookies.get).mockReturnValue("{bad json");

    expect(getAccessToken()).toBeUndefined();
  });

  it("getJsonAuthHeaders includes authorization when token exists", () => {
    vi.mocked(Cookies.get).mockReturnValue(
      JSON.stringify({ access_token: "abc" })
    );

    expect(getJsonAuthHeaders()).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer abc",
    });
  });

  it("getJsonAuthHeaders only sets content type when token is missing", () => {
    vi.mocked(Cookies.get).mockReturnValue(undefined);

    expect(getJsonAuthHeaders()).toEqual({
      "Content-Type": "application/json",
    });
  });
});

