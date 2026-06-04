import { getRequestLogContext } from "@/common/logging/request-log-context";
import type { StructuredLogger } from "@/common/logging/structured-logger.service";

import { Prisma } from "@prisma/client";

export const createSlowQueryLoggingExtension = (
  logger: StructuredLogger,
  thresholdMs: number
) =>
  Prisma.defineExtension({
    name: "slowQueryLogging",
    query: {
      $allModels: {
        async $allOperations({ model, operation, query, args }) {
          const started = performance.now();
          let outcome: "success" | "error" = "success";

          try {
            return await query(args);
          } catch (error: unknown) {
            outcome = "error";
            throw error;
          } finally {
            const duration_ms = Math.round(performance.now() - started);
            if (duration_ms >= thresholdMs) {
              const requestContext = getRequestLogContext();
              const routeTemplate = requestContext?.route_template?.trim();
              const route =
                routeTemplate !== undefined && routeTemplate.length > 0
                  ? routeTemplate
                  : null;

              logger.logDb({
                level: "warn",
                event: "db.query.slow",
                message: "Slow database query",
                meta: {
                  duration_ms,
                  threshold_ms: thresholdMs,
                  model,
                  operation,
                  query_kind: "prisma_model_operation",
                  outcome,
                  route
                }
              });
            }
          }
        }
      }
    }
  });
