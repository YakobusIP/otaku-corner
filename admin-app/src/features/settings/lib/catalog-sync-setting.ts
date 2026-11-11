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
    return DEFAULT_MEDIA_CATALOG_SYNC_SETTING;
  }

  const record = value as Record<string, unknown>;
  const enabled =
    typeof record.enabled === "boolean"
      ? record.enabled
      : DEFAULT_MEDIA_CATALOG_SYNC_SETTING.enabled;
  const intervalDays =
    typeof record.intervalDays === "number" &&
    Number.isInteger(record.intervalDays) &&
    record.intervalDays >= 1 &&
    record.intervalDays <= 365
      ? record.intervalDays
      : DEFAULT_MEDIA_CATALOG_SYNC_SETTING.intervalDays;

  return { enabled, intervalDays };
};
