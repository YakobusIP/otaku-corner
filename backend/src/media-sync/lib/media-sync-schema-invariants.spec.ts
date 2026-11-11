import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("media sync schema invariants", () => {
  it("keeps the partial unique index for one open conflict per media in SQL migrations", () => {
    const migrationPath = join(
      __dirname,
      "../../../prisma/migrations/20260830150000_media_sync_one_open_conflict_per_media/migration.sql"
    );
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain(
      'CREATE UNIQUE INDEX "MediaSyncItem_one_open_conflict_per_media_key"'
    );
    expect(sql).toContain("WHERE outcome = 'CONFLICT'");
  });

  it("keeps the per-run media unique index for terminal outcome idempotency", () => {
    const migrationPath = join(
      __dirname,
      "../../../prisma/migrations/20260830190000_media_sync_item_per_run_unique/migration.sql"
    );
    const sql = readFileSync(migrationPath, "utf8");

    expect(sql).toContain(
      'CREATE UNIQUE INDEX "MediaSyncItem_syncRunId_mediaType_mediaId_key"'
    );
    expect(sql).toContain('PARTITION BY "syncRunId", "mediaType", "mediaId"');
  });
});
