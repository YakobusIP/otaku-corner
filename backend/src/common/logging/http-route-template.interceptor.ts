import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { PATH_METADATA } from "@nestjs/common/constants";

import { GLOBAL_API_PREFIX } from "@/common/logging/http-request-log.utils";

import type { Request } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

function normalizePathMeta(meta: string | string[] | undefined): string {
  if (meta === undefined || meta === "") {
    return "";
  }
  const parts = (Array.isArray(meta) ? meta : [meta]).filter(Boolean);
  return parts.join("/");
}

function buildRouteTemplate(
  controllerMeta: string | string[] | undefined,
  handlerMeta: string | string[] | undefined
): string {
  const controllerPath = normalizePathMeta(controllerMeta);
  const handlerPath = normalizePathMeta(handlerMeta);
  const segments = [GLOBAL_API_PREFIX, controllerPath, handlerPath].filter(
    (segment) => segment.length > 0
  );
  return `/${segments.join("/")}`;
}

type RequestWithLogState = Request & {
  requestLogStore?: { route_template?: string };
  requestLogRouteError?: unknown;
};

@Injectable()
export class HttpRouteTemplateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<RequestWithLogState>();
    const controller = context.getClass();
    const handler = context.getHandler();
    const controllerPath = Reflect.getMetadata(PATH_METADATA, controller) as
      | string
      | string[]
      | undefined;
    const handlerPath = Reflect.getMetadata(PATH_METADATA, handler) as
      | string
      | string[]
      | undefined;
    const routeTemplate = buildRouteTemplate(controllerPath, handlerPath);

    if (req.requestLogStore) {
      req.requestLogStore.route_template = routeTemplate;
    }

    return next.handle().pipe(
      tap({
        error: (error: unknown) => {
          req.requestLogRouteError = error;
        }
      })
    );
  }
}
