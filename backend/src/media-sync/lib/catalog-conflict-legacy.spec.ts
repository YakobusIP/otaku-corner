import { MediaSyncItemOutcome } from "@prisma/client";

import {
  collectContestedConflictFields,
  hasTrustedConflictBaseline,
  isLegacyUntrustedConflictItem,
  mergeOpenConflictFields,
  mergeTrustedOpenConflictFields,
  omitCatalogFields,
  openConflictDisplayChanged,
  parseConflictItemBaselineCatalog,
  refreshOpenConflictSnapshots
} from "./catalog-conflict-legacy";
import { reconcilePlanConflictsWithResolutions } from "./catalog-conflict-reconcile";
import type { SyncConflict } from "./catalog-sync-merge";

describe("catalog-conflict-legacy", () => {
  it("treats missing baseline snapshot as untrusted legacy state", () => {
    expect(hasTrustedConflictBaseline(null)).toBe(false);
    expect(hasTrustedConflictBaseline({})).toBe(false);
    expect(
      isLegacyUntrustedConflictItem({
        outcome: MediaSyncItemOutcome.CONFLICT,
        baselineCatalog: null
      })
    ).toBe(true);
  });

  it("treats non-empty baseline snapshot as trusted three-way state", () => {
    expect(hasTrustedConflictBaseline({ synopsis: "Base text" })).toBe(true);
    expect(
      isLegacyUntrustedConflictItem({
        outcome: MediaSyncItemOutcome.CONFLICT,
        baselineCatalog: { synopsis: "Base text" }
      })
    ).toBe(false);
  });

  it("does not flag resolved items as legacy", () => {
    expect(
      isLegacyUntrustedConflictItem({
        outcome: MediaSyncItemOutcome.RESOLVED_KEPT,
        baselineCatalog: null
      })
    ).toBe(false);
  });

  it("omits contested fields from apply maps", () => {
    expect(
      omitCatalogFields(
        { synopsis: "New", status: "Airing" },
        new Set(["synopsis"])
      )
    ).toEqual({ status: "Airing" });
  });

  it("merges trusted open conflicts without overwriting existing bases", () => {
    const existing = [
      {
        field: "status",
        base: "Finished",
        local: "On Hold",
        upstream: "Completed",
        rule: "divergent_change" as const
      }
    ];
    const incoming = [
      {
        field: "status",
        base: "Airing",
        local: "Completed",
        upstream: "Completed",
        rule: "divergent_change" as const
      }
    ];

    const merged = mergeTrustedOpenConflictFields(existing, incoming);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.base).toBe("Finished");
  });

  it("parses stored conflict baseline catalogs", () => {
    expect(parseConflictItemBaselineCatalog(null)).toEqual({});
    expect(parseConflictItemBaselineCatalog({ status: "Finished" })).toEqual({
      status: "Finished"
    });
  });

  it("merges legacy and newly detected plan conflicts by field", () => {
    const merged = mergeOpenConflictFields(
      [
        {
          field: "status",
          base: null,
          local: "On Hold",
          upstream: "Completed",
          rule: "divergent_change"
        }
      ],
      [
        {
          field: "score",
          base: 8,
          local: 8,
          upstream: 8.5,
          rule: "divergent_change"
        }
      ]
    );

    expect(merged.map((conflict) => conflict.field).sort()).toEqual([
      "score",
      "status"
    ]);
  });

  it("refreshes local and upstream snapshots from current values", () => {
    const refreshed = refreshOpenConflictSnapshots(
      [
        {
          field: "status",
          base: null,
          local: "On Hold",
          upstream: "Completed",
          rule: "divergent_change"
        }
      ],
      { status: "Watching" },
      { status: "Airing" }
    );

    expect(refreshed[0]?.local).toBe("Watching");
    expect(refreshed[0]?.upstream).toBe("Airing");
    expect(refreshed[0]?.base).toBeNull();
  });

  it("collects contested fields across merged conflicts", () => {
    expect(
      collectContestedConflictFields([
        {
          field: "status",
          base: null,
          local: "A",
          upstream: "B",
          rule: "divergent_change"
        },
        {
          field: "score",
          base: 8,
          local: 8,
          upstream: 8.5,
          rule: "divergent_change"
        }
      ])
    ).toEqual(new Set(["status", "score"]));
  });

  it("detects when displayed conflict payload changed", () => {
    const conflict = {
      field: "status",
      base: null,
      local: "On Hold",
      upstream: "Completed",
      rule: "divergent_change" as const
    };

    expect(
      openConflictDisplayChanged({
        beforeConflicts: [conflict],
        afterConflicts: [{ ...conflict, upstream: "Airing" }],
        beforePendingUpstream: { status: "Completed" },
        afterPendingUpstream: { status: "Airing" },
        beforeMediaTitle: "Title",
        afterMediaTitle: "Title"
      })
    ).toBe(true);
  });

  it("suppresses legacy plan conflicts reconciled by prior partial resolutions", () => {
    const scoreConflict: SyncConflict = {
      field: "score",
      base: 8,
      local: 8,
      upstream: 8.5,
      rule: "divergent_change"
    };
    const statusConflict: SyncConflict = {
      field: "status",
      base: null,
      local: "On Hold",
      upstream: "Completed",
      rule: "divergent_change"
    };
    const reconciledPlanConflicts = reconcilePlanConflictsWithResolutions({
      planConflicts: [statusConflict, scoreConflict],
      priorResolutions: { status: "keep_local" },
      storedBaseline: { status: "Completed" }
    });
    const merged = mergeOpenConflictFields([], reconciledPlanConflicts);

    expect(merged).toEqual([scoreConflict]);
  });
});
