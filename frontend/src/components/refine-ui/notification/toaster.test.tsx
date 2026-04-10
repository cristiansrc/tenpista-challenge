import { Toaster as NotificationToaster } from "./toaster";
import { Toaster as UiToaster } from "@/components/ui/sonner";

describe("notification toaster re-export", () => {
  it("re-exports the ui toaster component", () => {
    expect(NotificationToaster).toBe(UiToaster);
  });
});
