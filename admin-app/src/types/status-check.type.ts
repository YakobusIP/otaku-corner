import type { LucideIcon } from "lucide-react";

export type StatusCheck = {
  key: string;
  Trigger: LucideIcon;
  condition: boolean;
  triggerColor: {
    success: string;
    failed: string;
  };
  message: {
    success: string;
    failed: string;
  };
};
