import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { HttpRouteTemplateInterceptor } from "@/common/logging/http-route-template.interceptor";
import { NestStructuredLoggerService } from "@/common/logging/nest-structured-logger.service";
import { StructuredLogger } from "@/common/logging/structured-logger.service";
import {
  STRUCTURED_LOGGER_BACKEND,
  createStructuredPinoBackend
} from "@/common/logging/structured-pino.factory";

import { join } from "path";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STRUCTURED_LOGGER_BACKEND,
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>("NODE_ENV") ?? "development";
        const logToFile =
          nodeEnv !== "production" &&
          (config.get<boolean>("LOG_TO_FILE") ?? false);

        return createStructuredPinoBackend({
          logDir: join(process.cwd(), "logs"),
          filename: "app.jsonl",
          level:
            config.get<"error" | "warn" | "info" | "debug">("LOG_LEVEL") ??
            "info",
          logToFile
        });
      },
      inject: [ConfigService]
    },
    StructuredLogger,
    NestStructuredLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpRouteTemplateInterceptor
    }
  ],
  exports: [StructuredLogger, NestStructuredLoggerService]
})
export class LoggingModule {}
