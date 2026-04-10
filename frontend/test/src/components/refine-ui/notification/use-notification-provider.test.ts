import { useNotificationProvider } from "@/components/refine-ui/notification/use-notification-provider";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("useNotificationProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes success notifications to toast.success", () => {
    const provider = useNotificationProvider();

    provider.open({ message: "ok", description: "saved", type: "success" });

    expect(toast.success).toHaveBeenCalledWith("ok", { description: "saved" });
  });

  it("routes error notifications to toast.error", () => {
    const provider = useNotificationProvider();

    provider.open({ message: "error", description: "failed", type: "error" });

    expect(toast.error).toHaveBeenCalledWith("error", { description: "failed" });
  });

  it("routes other notifications to default toast", () => {
    const provider = useNotificationProvider();

    provider.open({ message: "info", description: "message", type: "progress" as never });

    expect(toast).toHaveBeenCalledWith("info", { description: "message" });
  });

  it("close is a no-op function", () => {
    const provider = useNotificationProvider();
    expect(() => provider.close()).not.toThrow();
  });
});

