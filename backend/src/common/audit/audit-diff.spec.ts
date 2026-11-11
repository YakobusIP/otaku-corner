import { buildAuditFieldDiff } from "./audit-diff";

describe("buildAuditFieldDiff", () => {
  it("omits fields whose values are unchanged", () => {
    const result = buildAuditFieldDiff(
      { title: "Same", score: 8 },
      { title: "Same", score: 8 }
    );

    expect(result).toEqual({ before: {}, after: {} });
  });

  it("includes changed scalar fields in before and after", () => {
    const result = buildAuditFieldDiff(
      { title: "Old", score: 7 },
      { title: "New", score: 7 }
    );

    expect(result).toEqual({
      before: { title: "Old" },
      after: { title: "New" }
    });
  });

  it("treats a missing key and null as different values", () => {
    const result = buildAuditFieldDiff({ score: 8 }, { score: 8, note: null });

    expect(result).toEqual({
      before: { note: null },
      after: { note: null }
    });
  });

  it("treats deeply equal objects as unchanged via JSON comparison", () => {
    const nested = { tags: ["a", "b"], meta: { id: 1 } };
    const result = buildAuditFieldDiff(
      { payload: nested },
      { payload: { tags: ["a", "b"], meta: { id: 1 } } }
    );

    expect(result).toEqual({ before: {}, after: {} });
  });

  it("records object field changes when JSON serialization differs", () => {
    const result = buildAuditFieldDiff(
      { payload: { count: 1 } },
      { payload: { count: 2 } }
    );

    expect(result).toEqual({
      before: { payload: { count: 1 } },
      after: { payload: { count: 2 } }
    });
  });

  it("diffs only the explicit field list when fields are provided", () => {
    const result = buildAuditFieldDiff(
      { title: "Old", score: 7, hidden: "x" },
      { title: "New", score: 99, hidden: "y" },
      ["title"]
    );

    expect(result).toEqual({
      before: { title: "Old" },
      after: { title: "New" }
    });
  });

  it("unionizes keys from both records when fields are omitted", () => {
    const result = buildAuditFieldDiff(
      { kept: 1, removed: true },
      { kept: 1, added: "yes" }
    );

    expect(result).toEqual({
      before: { removed: true, added: null },
      after: { removed: null, added: "yes" }
    });
  });

  it("normalizes undefined sides to null in the diff output", () => {
    const result = buildAuditFieldDiff({}, { onlyAfter: "v" }, ["onlyAfter"]);

    expect(result).toEqual({
      before: { onlyAfter: null },
      after: { onlyAfter: "v" }
    });
  });
});
