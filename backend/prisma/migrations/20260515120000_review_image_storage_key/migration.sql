ALTER TABLE "ReviewImage" ADD COLUMN "storageKey" TEXT;

UPDATE "ReviewImage" AS ri
SET "storageKey" = CASE
  WHEN
    regexp_replace(
      b.base,
      '^https://storage\.googleapis\.com/otaku-corner-bucket/',
      ''
    )
    <> b.base
  THEN regexp_replace(
    b.base,
    '^https://storage\.googleapis\.com/otaku-corner-bucket/',
    ''
  )
  ELSE regexp_replace(b.base, '^.*/', '')
END
FROM (
  SELECT
    "id",
    CASE
      WHEN position('?' in "url") > 0 THEN left("url", position('?' in "url") - 1)
      ELSE "url"
    END AS base
  FROM "ReviewImage"
  WHERE "storageKey" IS NULL
) AS b
WHERE ri.id = b.id AND ri."storageKey" IS NULL;

ALTER TABLE "ReviewImage" ALTER COLUMN "storageKey" SET NOT NULL;

CREATE UNIQUE INDEX "ReviewImage_storageKey_key" ON "ReviewImage"("storageKey");
