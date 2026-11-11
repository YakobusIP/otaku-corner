import { lockMediaCatalogRowForUpdate } from "./media-catalog-row-lock";

describe("media-catalog-row-lock", () => {
  it("returns true when the catalog row exists", async () => {
    const queryRaw = jest.fn().mockResolvedValue([{ id: 1 }]);
    await expect(
      lockMediaCatalogRowForUpdate({ $queryRaw: queryRaw } as never, "ANIME", 1)
    ).resolves.toBe(true);
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it("returns false when the catalog row is missing", async () => {
    const queryRaw = jest.fn().mockResolvedValue([]);
    await expect(
      lockMediaCatalogRowForUpdate(
        { $queryRaw: queryRaw } as never,
        "MANGA",
        99
      )
    ).resolves.toBe(false);
  });

  it("issues a separate lock query per media type", async () => {
    const queryRaw = jest.fn().mockResolvedValue([{ id: 1 }]);
    const tx = { $queryRaw: queryRaw };

    await lockMediaCatalogRowForUpdate(tx as never, "LIGHT_NOVEL", 3);

    expect(queryRaw).toHaveBeenCalledTimes(1);
  });
});
