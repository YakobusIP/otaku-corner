import {
  collectContestedConflictFields,
  mergeTrustedOpenConflictFields,
  omitCatalogFields,
  parseConflictItemBaselineCatalog,
  refreshOpenConflictSnapshots
} from "./catalog-conflict-legacy";
import {
  buildConflictBaselineSnapshot,
  reconcilePlanConflictsWithResolutions
} from "./catalog-conflict-reconcile";
import type { SyncConflict } from "./catalog-sync-merge";

describe("trusted open conflict guards", () => {
  const statusConflict: SyncConflict = {
    field: "status",
    base: "Finished",
    local: "On Hold",
    upstream: "Completed",
    rule: "divergent_change"
  };

  it("preserves existing open conflict base and blocks contested apply/baseline", () => {
    const existingConflicts = [statusConflict];
    const reconciledPlanConflicts: SyncConflict[] = [];
    const merged = mergeTrustedOpenConflictFields(
      existingConflicts,
      reconciledPlanConflicts
    );
    const conflicts = refreshOpenConflictSnapshots(
      merged,
      { status: "Completed" },
      { status: "Completed" }
    );

    const applyData = { status: "Completed", score: 8.5 };
    const baselineUpdates = { status: "Completed", score: 8.5 };
    const contestedFields = collectContestedConflictFields(conflicts);
    const safeApplyData = omitCatalogFields(applyData, contestedFields);
    const safeBaselineUpdates = omitCatalogFields(
      baselineUpdates,
      contestedFields
    );

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.base).toBe("Finished");
    expect(conflicts[0]?.local).toBe("Completed");
    expect(safeApplyData).toEqual({ score: 8.5 });
    expect(safeBaselineUpdates).toEqual({ score: 8.5 });
  });

  it("merges newly discovered plan conflicts without overwriting trusted bases", () => {
    const existingConflicts = [statusConflict];
    const scoreConflict: SyncConflict = {
      field: "score",
      base: 8,
      local: 8,
      upstream: 8.5,
      rule: "divergent_change"
    };
    const merged = mergeTrustedOpenConflictFields(existingConflicts, [
      scoreConflict
    ]);

    expect(merged.map((conflict) => conflict.field).sort()).toEqual([
      "score",
      "status"
    ]);
    expect(merged.find((conflict) => conflict.field === "status")?.base).toBe(
      "Finished"
    );
    expect(merged.find((conflict) => conflict.field === "score")?.base).toBe(8);
  });

  it("does not reopen fields suppressed by prior resolutions", () => {
    const reconciled = reconcilePlanConflictsWithResolutions({
      planConflicts: [statusConflict],
      priorResolutions: { status: "keep_local" },
      storedBaseline: { status: "Completed" }
    });
    const merged = mergeTrustedOpenConflictFields([], reconciled);

    expect(merged).toEqual([]);
  });

  it("preserves stored item baseline bases in conflict snapshots", () => {
    const storedBaseline = parseConflictItemBaselineCatalog({
      status: "Finished"
    });
    const snapshot = buildConflictBaselineSnapshot(
      { status: "Rebased", score: 8 },
      [statusConflict]
    );
    const trustedSnapshot = buildConflictBaselineSnapshot(
      { score: 8, ...storedBaseline },
      [statusConflict]
    );

    expect(snapshot).toEqual({ status: "Rebased" });
    expect(trustedSnapshot).toEqual({ status: "Finished" });
  });
});
