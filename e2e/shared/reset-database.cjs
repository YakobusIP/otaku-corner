const { execFileSync } = require("node:child_process");
const { createRequire } = require("node:module");
const path = require("node:path");

const { applyBackendEnv } = require("./env.cjs");

const repoRoot = path.resolve(__dirname, "../..");
const requireFromBackend = createRequire(
  path.join(repoRoot, "backend/package.json")
);

const RESET_LOCK_KEY = 924001;

const resetE2eDatabase = async () => {
  applyBackendEnv();
  const backendDir = path.join(repoRoot, "backend");

  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
    cwd: backendDir,
    env: process.env,
    stdio: "inherit"
  });

  const { PrismaClient } = requireFromBackend("@prisma/client");
  const bcrypt = requireFromBackend("bcrypt");
  const prisma = new PrismaClient();

  try {
    await prisma.$executeRawUnsafe(
      `SELECT pg_advisory_lock(${RESET_LOCK_KEY})`
    );

    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
        table_name text;
      BEGIN
        FOR table_name IN
          SELECT tablename
          FROM pg_tables
          WHERE schemaname = 'public'
            AND tablename <> '_prisma_migrations'
        LOOP
          EXECUTE format('TRUNCATE TABLE %I CASCADE', table_name);
        END LOOP;
      END $$;
    `);

    const pin1 = await bcrypt.hash("135790", 4);
    const pin2 = await bcrypt.hash("246801", 4);
    await prisma.adminPin.create({
      data: { pin1, pin2 }
    });

    await prisma.appSetting.createMany({
      data: [
        {
          key: "review.personal_score_weights.anime",
          value: {
            storylineRating: 0.3,
            qualityRating: 0.25,
            voiceActingRating: 0.2,
            soundTrackRating: 0.15,
            charDevelopmentRating: 0.1
          }
        },
        {
          key: "review.personal_score_weights.manga",
          value: {
            storylineRating: 0.3,
            artStyleRating: 0.25,
            charDevelopmentRating: 0.2,
            worldBuildingRating: 0.15,
            originalityRating: 0.1
          }
        },
        {
          key: "review.personal_score_weights.light_novel",
          value: {
            storylineRating: 0.3,
            worldBuildingRating: 0.25,
            writingStyleRating: 0.2,
            charDevelopmentRating: 0.15,
            originalityRating: 0.1
          }
        },
        {
          key: "media.catalog_sync",
          value: { enabled: false, intervalDays: 14 }
        }
      ]
    });
  } finally {
    await prisma
      .$executeRawUnsafe(`SELECT pg_advisory_unlock(${RESET_LOCK_KEY})`)
      .catch(() => undefined);
    await prisma.$disconnect();
  }
};

module.exports = { resetE2eDatabase };
