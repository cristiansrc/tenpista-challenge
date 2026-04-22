import { describe, it, expect, vi } from "vitest";
import { useNotificationProvider } from "@/components/refine-ui/notification/use-notification-provider";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("useNotificationProvider", () => {
  const provider = useNotificationProvider();

  it("routes success notifications to toast.success", () => {
    provider.open({ key: "1", message: "Success", type: "success" });
    expect(toast.success).toHaveBeenCalledWith("Success", { description: undefined });
  });

  it("routes error notifications to toast.error", () => {
    provider.open({ key: "2", message: "Error", type: "error" });
    expect(toast.error).toHaveBeenCalledWith("Error", { description: undefined });
  });

  it("routes other notifications to default toast", () => {
    provider.open({ key: "3", message: "Info", type: "progress" });
    expect(toast).toHaveBeenCalledWith("Info", { description: undefined });
  });

  it("close is a no-op function", () => {
    expect(provider.close).toBeTypeOf("function");
    expect(provider.close("key")).toBeUndefined();
  });
});
