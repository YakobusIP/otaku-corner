import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { createSlowQueryLoggingExtension } from "@/prisma/prisma-slow-query.extension";

import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  onModuleInit!: () => Promise<void>;

  onModuleDestroy!: () => Promise<void>;

  constructor(
    private readonly logger: StructuredLogger,
    private readonly config: ConfigService
  ) {
    super();
    const thresholdMs = config.getOrThrow<number>("DB_SLOW_QUERY_THRESHOLD_MS");
    const extendedClient = this.$extends(
      createSlowQueryLoggingExtension(logger, thresholdMs)
    );

    return Object.assign(extendedClient, {
      onModuleInit: async () => {
        try {
          await extendedClient.$connect();
          logger.logDb({
            level: "info",
            event: "db.connected",
            message: "Database connected",
            meta: {}
          });
        } catch (error: unknown) {
          logger.logDb({
            level: "error",
            event: "db.connect_failed",
            message: "Database connection failed",
            error:
              error instanceof Error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack ?? ""
                  }
                : {
                    name: "Error",
                    message: String(error),
                    stack: ""
                  },
            meta: {}
          });
          throw error;
        }
      },
      onModuleDestroy: async () => {
        await extendedClient.$disconnect();
        logger.logDb({
          level: "info",
          event: "db.disconnected",
          message: "Database disconnected",
          meta: {}
        });
      }
    }) as this;
  }
}
