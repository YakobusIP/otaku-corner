import type { INestApplication } from "@nestjs/common";

import request from "supertest";

import { createTestApp, login } from "./create-test-app";
import { disconnectTestPrisma, resetDatabase } from "./reset-database";

describe("API boot (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await disconnectTestPrisma();
  });

  it("logs in with the seeded pins and rejects a missing token", async () => {
    const accessToken = await login(app);

    await request(app.getHttpServer())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer()).get("/api/auth/me").expect(401);
  });
});
