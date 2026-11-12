import { test as setup } from "@playwright/test";

import { seedLibrary } from "../../shared/seed-library.cjs";

setup("seed library through the HTTP API", async () => {
  await seedLibrary();
});
