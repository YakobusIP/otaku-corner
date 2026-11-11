-- Backfilled baselines copied local catalog values before any upstream snapshot.
-- Clear catalog JSON so runtime treats baseline as absent until a verified sync writes it.
UPDATE "MediaCatalogSyncState"
SET "baselineCatalog" = '{}'::jsonb
WHERE "baselineSource" = 'backfill';
