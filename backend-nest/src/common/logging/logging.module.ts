import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { HttpAccessLoggingInterceptor } from "@/common/logging/http-access-logging.interceptor";
import { StructuredLogger } from "@/common/logging/structured-logger.service";
import {
  STRUCTURED_WINSTON,
  createStructuredWinstonLogger
} from "@/common/logging/structured-winston.factory";
import { WinstonLoggerService } from "@/common/logging/winston-logger.service";

import { join } from "path";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STRUCTURED_WINSTON,
      useFactory: (config: ConfigService) =>
        createStructuredWinstonLogger({
          logDir: join(process.cwd(), "logs"),
          filename: "app.jsonl",
          level:
            config.get<"error" | "warn" | "info" | "debug">("LOG_LEVEL") ??
            "info",
          logToStdout: config.get<boolean>("LOG_TO_STDOUT") ?? true
        }),
      inject: [ConfigService]
    },
    StructuredLogger,
    WinstonLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpAccessLoggingInterceptor
    }
  ],
  exports: [StructuredLogger, WinstonLoggerService]
})
export class LoggingModule {}
