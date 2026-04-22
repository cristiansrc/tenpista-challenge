import type { NotificationProvider } from "@refinedev/core";
import { toast } from "sonner";

export const useNotificationProvider = (): NotificationProvider => ({
  open: ({ message, description, type }) => {
    if (type === "success") {
      toast.success(message, { description });
    } else if (type === "error") {
      toast.error(message, { description });
    } else {
      toast(message, { description });
    }
  },
  close: () => {},
});
