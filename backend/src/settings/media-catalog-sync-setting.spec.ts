import {
  DEFAULT_MEDIA_CATALOG_SYNC_SETTING,
  parseMediaCatalogSyncSetting
} from "./media-catalog-sync-setting";

describe("DEFAULT_MEDIA_CATALOG_SYNC_SETTING", () => {
  it("matches the documented default enabled and intervalDays", () => {
    expect(DEFAULT_MEDIA_CATALOG_SYNC_SETTING).toEqual({
      enabled: true,
      intervalDays: 14
    });
  });
});

const OBJECT_MESSAGE = "media.catalog_sync must be a JSON object";
const INTERVAL_MESSAGE =
  "media.catalog_sync.intervalDays must be an integer between 1 and 365";

describe("parseMediaCatalogSyncSetting", () => {
  it("returns enabled and intervalDays for a valid object", () => {
    expect(
      parseMediaCatalogSyncSetting({ enabled: false, intervalDays: 30 })
    ).toEqual({ enabled: false, intervalDays: 30 });
  });

  it.each([null, [], "x", 1])("rejects non-object value %p", (value) => {
    expect(() => parseMediaCatalogSyncSetting(value)).toThrow(OBJECT_MESSAGE);
  });

  it("rejects enabled when it is missing or not a boolean", () => {
    expect(() => parseMediaCatalogSyncSetting({ intervalDays: 14 })).toThrow(
      "media.catalog_sync.enabled must be a boolean"
    );
    expect(() =>
      parseMediaCatalogSyncSetting({ enabled: "true", intervalDays: 14 })
    ).toThrow("media.catalog_sync.enabled must be a boolean");
  });

  it.each([
    { enabled: true },
    { enabled: true, intervalDays: 14.5 },
    { enabled: true, intervalDays: "14" },
    { enabled: true, intervalDays: 0 },
    { enabled: true, intervalDays: 366 }
  ])("rejects invalid intervalDays %p", (value) => {
    expect(() => parseMediaCatalogSyncSetting(value)).toThrow(INTERVAL_MESSAGE);
  });

  it("accepts intervalDays at the lower and upper bounds", () => {
    expect(
      parseMediaCatalogSyncSetting({ enabled: true, intervalDays: 1 })
    ).toEqual({ enabled: true, intervalDays: 1 });
    expect(
      parseMediaCatalogSyncSetting({ enabled: true, intervalDays: 365 })
    ).toEqual({ enabled: true, intervalDays: 365 });
  });
});
