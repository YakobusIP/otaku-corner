import type { RequestLogContextStore } from "@/common/logging/request-log-context";

declare global {
  namespace Express {
    interface Request {
      requestLogStore?: RequestLogContextStore;
    }
  }
}

export {};
