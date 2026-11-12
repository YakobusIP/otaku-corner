import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import { MEDIA_CATALOG_SYNC_SETTING_KEY } from "@/settings/media-catalog-sync-setting";

import "./set-test-env";

export const TEST_PIN_1 = "135790";
export const TEST_PIN_2 = "246801";

const WEIGHT_SETTINGS = [
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
  }
] as const;

let prisma: PrismaClient | undefined;

export const getTestPrisma = (): PrismaClient => {
  prisma ??= new PrismaClient();
  return prisma;
};

export const disconnectTestPrisma = async (): Promise<void> => {
  if (!prisma) {
    return;
  }
  await prisma.$disconnect();
  prisma = undefined;
};

export const resetDatabase = async (): Promise<void> => {
  const client = getTestPrisma();
  await client.$executeRawUnsafe(`
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

  const pin1 = await bcrypt.hash(TEST_PIN_1, 4);
  const pin2 = await bcrypt.hash(TEST_PIN_2, 4);
  await client.adminPin.create({
    data: { pin1, pin2 }
  });

  await client.appSetting.createMany({
    data: [
      ...WEIGHT_SETTINGS.map((setting) => ({
        key: setting.key,
        value: setting.value
      })),
      {
        key: MEDIA_CATALOG_SYNC_SETTING_KEY,
        value: { enabled: false, intervalDays: 14 }
      }
    ]
  });
};
