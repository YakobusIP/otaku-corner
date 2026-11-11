import {
  assertAcceptableApplyData,
  isUpstreamFieldPresent,
  sanitizeBaselineUpdates,
  sanitizeCatalogApplyData
} from "./catalog-field-policy";
import { computeCatalogMergePlan } from "./catalog-sync-plan";

describe("catalog-field-policy", () => {
  it("treats absent upstream fields as not present", () => {
    expect(isUpstreamFieldPresent({ title: "A" }, "title")).toBe(true);
    expect(isUpstreamFieldPresent({ title: "A" }, "score")).toBe(false);
    expect(isUpstreamFieldPresent({ score: null }, "score")).toBe(true);
  });

  it("rejects null apply values for required catalog fields", () => {
    expect(() => assertAcceptableApplyData("ANIME", { title: null })).toThrow(
      'required catalog field "title"'
    );
  });

  it("allows null apply values for nullable catalog fields", () => {
    expect(() =>
      assertAcceptableApplyData("ANIME", { trailer: null })
    ).not.toThrow();
  });

  it("drops undefined baseline updates but keeps explicit null for required fields", () => {
    expect(
      sanitizeBaselineUpdates("ANIME", {
        title: undefined,
        trailer: null,
        synopsis: ""
      })
    ).toEqual({
      trailer: null,
      synopsis: ""
    });
  });

  it("keeps explicit null for required catalog fields in baseline updates", () => {
    expect(
      sanitizeBaselineUpdates("ANIME", {
        synopsis: null
      })
    ).toEqual({ synopsis: null });
  });

  it("drops required null from catalog apply data while keeping nullable nulls", () => {
    expect(
      sanitizeCatalogApplyData("ANIME", {
        synopsis: null,
        trailer: null
      })
    ).toEqual({ trailer: null });
  });
});

describe("computeCatalogMergePlan", () => {
  it("skips fields absent from upstream payload", () => {
    const plan = computeCatalogMergePlan({
      mediaType: "ANIME",
      fields: ["synopsis", "score"],
      localRecord: { synopsis: "Same text", score: 8.1 },
      upstreamCatalog: { synopsis: "Updated upstream text" },
      storedBaseline: { synopsis: "Same text", score: 8.1 }
    });

    expect(plan.applyData).toEqual({ synopsis: "Updated upstream text" });
    expect(plan.baselineUpdates).toEqual({ synopsis: "Updated upstream text" });
    expect(plan.conflicts).toEqual([]);
  });

  it("advances baseline on trusted noop when only local changed from baseline", () => {
    const trustedPlan = computeCatalogMergePlan({
      mediaType: "ANIME",
      fields: ["synopsis"],
      localRecord: { synopsis: "Edited" },
      upstreamCatalog: { synopsis: "Base text" },
      storedBaseline: { synopsis: "Base text" }
    });

    expect(trustedPlan.applyData).toEqual({});
    expect(trustedPlan.baselineUpdates).toEqual({ synopsis: "Base text" });
  });

  it("establishes baseline when untrusted fields match upstream and later applies upstream-only changes", () => {
    const establishPlan = computeCatalogMergePlan({
      mediaType: "ANIME",
      fields: ["synopsis"],
      localRecord: { synopsis: "Shared synopsis" },
      upstreamCatalog: { synopsis: "Shared synopsis" },
      storedBaseline: null
    });

    expect(establishPlan.applyData).toEqual({});
    expect(establishPlan.conflicts).toEqual([]);
    expect(establishPlan.baselineUpdates).toEqual({
      synopsis: "Shared synopsis"
    });

    const followUpPlan = computeCatalogMergePlan({
      mediaType: "ANIME",
      fields: ["synopsis"],
      localRecord: { synopsis: "Shared synopsis" },
      upstreamCatalog: { synopsis: "Updated upstream synopsis" },
      storedBaseline: { synopsis: "Shared synopsis" }
    });

    expect(followUpPlan.applyData).toEqual({
      synopsis: "Updated upstream synopsis"
    });
    expect(followUpPlan.baselineUpdates).toEqual({
      synopsis: "Updated upstream synopsis"
    });
    expect(followUpPlan.conflicts).toEqual([]);
  });

  it("fills empty local fields without trusted baseline but conflicts on populated drift", () => {
    const fillPlan = computeCatalogMergePlan({
      mediaType: "ANIME",
      fields: ["synopsis"],
      localRecord: { synopsis: "" },
      upstreamCatalog: { synopsis: "Upstream synopsis" },
      storedBaseline: null
    });

    expect(fillPlan.applyData).toEqual({ synopsis: "Upstream synopsis" });
    expect(fillPlan.baselineUpdates).toEqual({ synopsis: "Upstream synopsis" });
    expect(fillPlan.conflicts).toEqual([]);

    const conflictPlan = computeCatalogMergePlan({
      mediaType: "ANIME",
      fields: ["synopsis"],
      localRecord: { synopsis: "Local synopsis" },
      upstreamCatalog: { synopsis: "Upstream synopsis" },
      storedBaseline: null
    });

    expect(conflictPlan.applyData).toEqual({});
    expect(conflictPlan.baselineUpdates).toEqual({});
    expect(conflictPlan.conflicts).toEqual([
      {
        field: "synopsis",
        base: null,
        local: "Local synopsis",
        upstream: "Upstream synopsis",
        rule: "divergent_change"
      }
    ]);
  });

  it("does not re-conflict after keep-local baseline records upstream null", () => {
    const firstPlan = computeCatalogMergePlan({
      mediaType: "ANIME",
      fields: ["synopsis"],
      localRecord: { synopsis: "Edited synopsis" },
      upstreamCatalog: { synopsis: null },
      storedBaseline: { synopsis: "Original baseline" }
    });

    expect(firstPlan.conflicts).toHaveLength(1);
    expect(firstPlan.conflicts[0]?.rule).toBe("null_clear");

    const baselineAfterKeepLocal = sanitizeBaselineUpdates("ANIME", {
      synopsis: null
    });
    expect(baselineAfterKeepLocal).toEqual({ synopsis: null });

    const secondPlan = computeCatalogMergePlan({
      mediaType: "ANIME",
      fields: ["synopsis"],
      localRecord: { synopsis: "Edited synopsis" },
      upstreamCatalog: { synopsis: null },
      storedBaseline: baselineAfterKeepLocal
    });

    expect(secondPlan.conflicts).toEqual([]);
    expect(secondPlan.applyData).toEqual({});
    expect(secondPlan.baselineUpdates).toEqual({ synopsis: null });
  });
});
