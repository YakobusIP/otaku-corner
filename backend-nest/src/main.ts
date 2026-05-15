import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PrismaExceptionFilter } from "@/common/filters/prisma-exception.filter";
import { WinstonLoggerService } from "@/common/logging/winston-logger.service";

import { AppModule } from "@/app.module";
import { CORS_ALLOWED_ORIGINS } from "@/config/cors-origins";

import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(WinstonLoggerService));
  app.flushLogs();

  app.setGlobalPrefix("api");

  app.use(cookieParser());

  const allowed = new Set<string>(CORS_ALLOWED_ORIGINS);

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

  const configService = app.get(ConfigService);

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Otaku Corner API")
    .setDescription("API documentation for Otaku Corner")
    .setVersion("1.0")
    .addTag("otaku-corner")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(configService.get<number>("PORT") ?? 5000);
}
void bootstrap();
