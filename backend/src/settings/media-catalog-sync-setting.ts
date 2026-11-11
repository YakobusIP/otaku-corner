export const MEDIA_CATALOG_SYNC_SETTING_KEY = "media.catalog_sync";

export type MediaCatalogSyncSettingValue = {
  enabled: boolean;
  intervalDays: number;
};

export const DEFAULT_MEDIA_CATALOG_SYNC_SETTING: MediaCatalogSyncSettingValue =
  {
    enabled: true,
    intervalDays: 14
  };

export const parseMediaCatalogSyncSetting = (
  value: unknown
): MediaCatalogSyncSettingValue => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("media.catalog_sync must be a JSON object");
  }

  const record = value as Record<string, unknown>;
  const enabled = record.enabled;
  const intervalDays = record.intervalDays;

  if (typeof enabled !== "boolean") {
    throw new Error("media.catalog_sync.enabled must be a boolean");
  }

  if (
    typeof intervalDays !== "number" ||
    !Number.isInteger(intervalDays) ||
    intervalDays < 1 ||
    intervalDays > 365
  ) {
    throw new Error(
      "media.catalog_sync.intervalDays must be an integer between 1 and 365"
    );
  }

  return { enabled, intervalDays };
};
