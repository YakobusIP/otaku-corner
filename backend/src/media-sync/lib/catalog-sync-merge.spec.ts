import { getFieldBaseline } from "./catalog-sync-fields";
import {
  catalogValuesEqual,
  hasFieldBaseline,
  mergeCatalogFieldFirstSync,
  mergeCatalogFieldThreeWay,
  mergeCatalogFieldUntrustedBaseline
} from "./catalog-sync-merge";

describe("getFieldBaseline", () => {
  it("returns undefined when the baseline row or field is absent", () => {
    expect(getFieldBaseline(null, "score")).toBeUndefined();
    expect(getFieldBaseline({}, "score")).toBeUndefined();
  });

  it("returns null when the field baseline is explicitly null", () => {
    expect(getFieldBaseline({ score: null }, "score")).toBeNull();
    expect(hasFieldBaseline(getFieldBaseline({ score: null }, "score"))).toBe(
      true
    );
  });
});

describe("mergeCatalogFieldThreeWay", () => {
  it("applies upstream when only upstream changed from baseline", () => {
    const result = mergeCatalogFieldThreeWay("score", 8.1, 8.1, 8.5);
    expect(result).toEqual({ kind: "apply", value: 8.5 });
  });

  it("keeps local when only local changed from baseline", () => {
    const result = mergeCatalogFieldThreeWay(
      "synopsis",
      "Original synopsis",
      "Edited synopsis",
      "Original synopsis"
    );
    expect(result).toEqual({ kind: "noop" });
  });

  it("treats matching local and upstream edits as resolved", () => {
    const result = mergeCatalogFieldThreeWay(
      "status",
      "Finished",
      "Completed",
      "Completed"
    );
    expect(result).toEqual({ kind: "noop" });
  });

  it("creates a divergent conflict when both sides changed differently", () => {
    const result = mergeCatalogFieldThreeWay(
      "status",
      "Finished",
      "On Hold",
      "Completed"
    );
    expect(result).toEqual({
      kind: "conflict",
      conflict: {
        field: "status",
        base: "Finished",
        local: "On Hold",
        upstream: "Completed",
        rule: "divergent_change"
      }
    });
  });

  it("uses first-sync regression rules when no baseline exists", () => {
    const result = mergeCatalogFieldThreeWay("episodesCount", undefined, 24, 0);
    expect(result.kind).toBe("conflict");
    if (result.kind === "conflict") {
      expect(result.conflict.rule).toBe("count_zero_regression");
      expect(result.conflict.base).toBeNull();
    }
  });

  it("uses three-way rules when baseline is explicitly null", () => {
    const result = mergeCatalogFieldThreeWay(
      "trailer",
      null,
      null,
      "https://x"
    );
    expect(result).toEqual({
      kind: "apply",
      value: "https://x"
    });
  });
});

describe("mergeCatalogFieldUntrustedBaseline", () => {
  it("auto-applies upstream when local is empty", () => {
    const result = mergeCatalogFieldUntrustedBaseline("score", null, 8.2);
    expect(result).toEqual({ kind: "apply", value: 8.2 });
  });

  it("flags null-clear conflicts when local is populated and upstream is empty", () => {
    const result = mergeCatalogFieldUntrustedBaseline(
      "synopsis",
      "Local text",
      ""
    );
    expect(result.kind).toBe("conflict");
    if (result.kind === "conflict") {
      expect(result.conflict.rule).toBe("null_clear");
      expect(result.conflict.base).toBeNull();
    }
  });

  it("conflicts instead of overwriting populated local values that differ from upstream", () => {
    const result = mergeCatalogFieldUntrustedBaseline(
      "synopsis",
      "Edited synopsis",
      "Upstream synopsis"
    );
    expect(result).toEqual({
      kind: "conflict",
      conflict: {
        field: "synopsis",
        base: null,
        local: "Edited synopsis",
        upstream: "Upstream synopsis",
        rule: "divergent_change"
      }
    });
  });

  it("noops when populated local already matches upstream", () => {
    expect(
      mergeCatalogFieldUntrustedBaseline("status", "Completed", "Completed")
    ).toEqual({ kind: "noop" });
  });

  it("preserves count regression conflicts for untrusted baselines", () => {
    const result = mergeCatalogFieldUntrustedBaseline("episodesCount", 24, 0);
    expect(result.kind).toBe("conflict");
    if (result.kind === "conflict") {
      expect(result.conflict.rule).toBe("count_zero_regression");
    }
  });
});

describe("mergeCatalogFieldFirstSync", () => {
  it("delegates to untrusted baseline semantics", () => {
    expect(mergeCatalogFieldFirstSync("score", null, 8.2)).toEqual({
      kind: "apply",
      value: 8.2
    });
    expect(
      mergeCatalogFieldFirstSync("synopsis", "Local text", "Upstream text")
    ).toEqual({
      kind: "conflict",
      conflict: {
        field: "synopsis",
        base: null,
        local: "Local text",
        upstream: "Upstream text",
        rule: "divergent_change"
      }
    });
  });
});

describe("catalogValuesEqual", () => {
  it("normalizes comparable strings", () => {
    expect(catalogValuesEqual("title", " Foo  Bar ", "Foo Bar")).toBe(true);
  });
});
