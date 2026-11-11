import {
  isTrustedBaselineCatalog,
  isTrustedBaselineSource
} from "./catalog-baseline-trust";

describe("catalog-baseline-trust", () => {
  it("treats backfill baseline source as untrusted", () => {
    expect(isTrustedBaselineSource("backfill")).toBe(false);
    expect(isTrustedBaselineCatalog({ title: "Example" }, "backfill")).toBe(
      false
    );
  });

  it("treats verified upstream sources as trusted when catalog is present", () => {
    expect(isTrustedBaselineSource("tenrai")).toBe(true);
    expect(isTrustedBaselineCatalog({ title: "Example" }, "tenrai")).toBe(true);
  });

  it("treats missing source or empty catalog as untrusted", () => {
    expect(isTrustedBaselineSource(null)).toBe(false);
    expect(isTrustedBaselineCatalog({}, "tenrai")).toBe(false);
    expect(isTrustedBaselineCatalog(null, "tenrai")).toBe(false);
  });
});
