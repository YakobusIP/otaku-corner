import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PrismaExceptionFilter } from "@/common/filters/prisma-exception.filter";
import { createHttpAccessLoggingMiddleware } from "@/common/logging/http-access-logging.middleware";
import { NestStructuredLoggerService } from "@/common/logging/nest-structured-logger.service";
import { registerProcessLifecycleLogging } from "@/common/logging/process-lifecycle";
import { safeSerializeForLog } from "@/common/logging/safe-serialize";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { AppModule } from "@/app.module";
import { getCorsOrigins } from "@/config/cors-origins";

import cookieParser from "cookie-parser";

const readAppVersion = (): string | undefined => {
  try {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8")
    ) as { version?: string };
    return packageJson.version;
  } catch {
    return undefined;
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const structuredLogger = app.get(StructuredLogger);
  const nestLogger = app.get(NestStructuredLoggerService);
  const configService = app.get(ConfigService);

  registerProcessLifecycleLogging(structuredLogger);

  const port = configService.get<number>("PORT") ?? 5000;
  const nodeEnv = configService.get<string>("NODE_ENV") ?? "development";
  const serviceName =
    configService.get<string>("LOG_SERVICE_NAME") ?? "backend-nest";
  const appVersion = readAppVersion();

  structuredLogger.logProcess({
    level: "info",
    event: "process.starting",
    message: "Process starting",
    meta: {
      port,
      node_env: nodeEnv,
      service_name: serviceName,
      ...(appVersion !== undefined ? { app_version: appVersion } : {})
    }
  });

  app.useLogger(nestLogger);
  app.flushLogs();

  app.use(createHttpAccessLoggingMiddleware(structuredLogger));

  app.setGlobalPrefix("api");

  app.use(cookieParser());

  const allowed = new Set<string>(getCorsOrigins(configService));

  app.enableCors({
    credentials: true,
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean | string) => void
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowed.has(origin)) {
        callback(null, origin);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  app.useGlobalFilters(app.get(PrismaExceptionFilter));

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Otaku Corner API")
    .setDescription("API documentation for Otaku Corner")
    .setVersion("1.0")
    .addTag("otaku-corner")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  const shutdown = async (signal: string) => {
    structuredLogger.logProcess({
      level: "info",
      event: "process.shutdown.started",
      message: "Process shutdown started",
      meta: { signal }
    });
    await app.close();
    structuredLogger.logProcess({
      level: "info",
      event: "process.shutdown.completed",
      message: "Process shutdown completed",
      meta: { signal }
    });
    structuredLogger.flushSync();
    process.exit(0);
  };

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  await app.listen(port);

  structuredLogger.logProcess({
    level: "info",
    event: "process.started",
    message: "Process started",
    meta: {
      port,
      node_env: nodeEnv,
      service_name: serviceName,
      ...(appVersion !== undefined ? { app_version: appVersion } : {})
    }
  });
}

void bootstrap().catch((error: unknown) => {
  const fallbackLine = safeSerializeForLog({
    timestamp: new Date().toISOString(),
    level: "fatal",
    service: "backend-nest",
    environment: process.env.NODE_ENV ?? "development",
    context: "process",
    event: "process.bootstrap_failed",
    message: "Bootstrap failed",
    correlation_id: null,
    request_id: null,
    user_id: null,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack ?? ""
          }
        : { name: "Error", message: String(error), stack: "" },
    meta: {}
  });
  try {
    process.stdout.write(`${JSON.stringify(fallbackLine)}\n`);
  } catch {
    process.stdout.write(
      '{"level":"fatal","message":"Bootstrap failed","event":"process.bootstrap_failed"}\n'
    );
  }
  process.exit(1);
});
