-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- Seed default review personal score weights
INSERT INTO "AppSetting" ("key", "value", "updatedAt") VALUES
(
    'review.personal_score_weights.anime',
    '{"storylineRating":0.3,"qualityRating":0.25,"voiceActingRating":0.2,"soundTrackRating":0.15,"charDevelopmentRating":0.1}'::jsonb,
    CURRENT_TIMESTAMP
),
(
    'review.personal_score_weights.manga',
    '{"storylineRating":0.3,"artStyleRating":0.25,"charDevelopmentRating":0.2,"worldBuildingRating":0.15,"originalityRating":0.1}'::jsonb,
    CURRENT_TIMESTAMP
),
(
    'review.personal_score_weights.light_novel',
    '{"storylineRating":0.3,"worldBuildingRating":0.25,"writingStyleRating":0.2,"charDevelopmentRating":0.15,"originalityRating":0.1}'::jsonb,
    CURRENT_TIMESTAMP
);
