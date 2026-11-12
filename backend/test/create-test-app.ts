import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { PrismaExceptionFilter } from "@/common/filters/prisma-exception.filter";

import { AppModule } from "@/app.module";
import { SettingsService } from "@/settings/settings.service";
import { R2FileStorageService } from "@/storage/r2-file-storage.service";
import { TenraiProxyService } from "@/tenrai/tenrai-proxy.service";

import cookieParser from "cookie-parser";
import request from "supertest";

import { fakeR2, tenraiForwardGet } from "./e2e-fakes";
import { TEST_PIN_1, TEST_PIN_2 } from "./reset-database";

import "./set-test-env";

export const createTestApp = async (): Promise<INestApplication> => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider(TenraiProxyService)
    .useValue({ forwardGet: tenraiForwardGet })
    .overrideProvider(R2FileStorageService)
    .useValue(fakeR2)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );
  app.useGlobalFilters(app.get(PrismaExceptionFilter));
  await app.init();
  return app;
};

export const clearSettingsCache = (app: INestApplication): void => {
  const settings = app.get(SettingsService);
  const cache: unknown = Reflect.get(settings, "cache");
  if (cache instanceof Map) {
    cache.clear();
  }
};

export const login = async (app: INestApplication): Promise<string> => {
  const response = await request(app.getHttpServer())
    .post("/api/auth/login")
    .send({ pin1: TEST_PIN_1, pin2: TEST_PIN_2 })
    .expect(200);

  const accessToken: unknown = response.body.accessToken;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("Login response did not include an access token");
  }
  return accessToken;
};

export const authHeader = (accessToken: string): { Authorization: string } => ({
  Authorization: `Bearer ${accessToken}`
});
