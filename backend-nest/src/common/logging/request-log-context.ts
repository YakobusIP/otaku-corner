import { AsyncLocalStorage } from "async_hooks";
import type { Request } from "express";

export type RequestLogContextStore = {
  correlation_id: string;
  request_id: string;
  user_id: string | number | null;
};

type RequestWithLogStore = Request & {
  requestLogStore?: RequestLogContextStore;
};

const requestLogContext = new AsyncLocalStorage<RequestLogContextStore>();

export function getRequestLogContext(): RequestLogContextStore | undefined {
  return requestLogContext.getStore();
}

export function runWithRequestLogContext<T>(
  store: RequestLogContextStore,
  fn: () => T
): T {
  return requestLogContext.run(store, fn);
}

export function getRequestLogContextFromRequest(
  req: RequestWithLogStore
): RequestLogContextStore | undefined {
  const fromReq = req.requestLogStore;
  return getRequestLogContext() ?? fromReq;
}
