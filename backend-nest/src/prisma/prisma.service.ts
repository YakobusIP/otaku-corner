import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logger: StructuredLogger) {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.logDb({
        level: "info",
        event: "db.connected",
        message: "Database connected",
        meta: {}
      });
    } catch (error: unknown) {
      this.logger.logDb({
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
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.logDb({
      level: "info",
      event: "db.disconnected",
      message: "Database disconnected",
      meta: {}
    });
  }
}
