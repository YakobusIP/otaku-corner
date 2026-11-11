import {
  buildConflictBaselineSnapshot,
  buildPendingUpstreamFromConflicts,
  outcomeForFieldResolutions,
  reconcilePlanConflictsWithResolutions
} from "./catalog-conflict-reconcile";
import type { SyncConflict } from "./catalog-sync-merge";

describe("catalog-conflict-reconcile", () => {
  const statusConflict: SyncConflict = {
    field: "status",
    base: "Finished",
    local: "On Hold",
    upstream: "Completed",
    rule: "divergent_change"
  };

  it("keeps unresolved plan conflicts without prior decisions", () => {
    expect(
      reconcilePlanConflictsWithResolutions({
        planConflicts: [statusConflict],
        priorResolutions: {},
        storedBaseline: { status: "Finished" }
      })
    ).toEqual([statusConflict]);
  });

  it("suppresses conflicts when upstream matches the resolved baseline snapshot", () => {
    expect(
      reconcilePlanConflictsWithResolutions({
        planConflicts: [statusConflict],
        priorResolutions: { status: "keep_local" },
        storedBaseline: { status: "Completed" }
      })
    ).toEqual([]);
  });

  it("reopens conflicts when upstream changes from the resolved baseline snapshot", () => {
    const reopened = reconcilePlanConflictsWithResolutions({
      planConflicts: [
        {
          ...statusConflict,
          upstream: "Airing"
        }
      ],
      priorResolutions: { status: "accept_upstream" },
      storedBaseline: { status: "Completed" }
    });

    expect(reopened).toHaveLength(1);
    expect(reopened[0]?.upstream).toBe("Airing");
  });

  it("builds pending upstream from active conflicts", () => {
    expect(buildPendingUpstreamFromConflicts([statusConflict])).toEqual({
      status: "Completed"
    });
  });

  it("builds conflict baseline snapshots for open fields only", () => {
    expect(
      buildConflictBaselineSnapshot({ status: "Finished", score: 8.1 }, [
        statusConflict
      ])
    ).toEqual({ status: "Finished" });
  });

  it("derives resolved outcomes from field resolution history", () => {
    expect(outcomeForFieldResolutions({ status: "keep_local" })).toBe(
      "RESOLVED_KEPT"
    );
    expect(
      outcomeForFieldResolutions({
        status: "keep_local",
        score: "accept_upstream"
      })
    ).toBe("RESOLVED_ACCEPTED");
  });
});
