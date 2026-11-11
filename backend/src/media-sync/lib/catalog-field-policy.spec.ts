import {
  buildBulkFieldChoiceMap,
  isRequiredNullClearConflict,
  listBlockedAcceptUpstreamFields
} from "./catalog-field-policy";

describe("catalog-field-policy accept upstream guards", () => {
  it("blocks required null_clear conflicts", () => {
    const conflict = {
      field: "title",
      rule: "null_clear",
      upstream: null
    };

    expect(isRequiredNullClearConflict("ANIME", conflict)).toBe(true);
    expect(listBlockedAcceptUpstreamFields("ANIME", [conflict])).toEqual([
      "title"
    ]);
  });

  it("allows nullable null_clear conflicts", () => {
    const conflict = {
      field: "score",
      rule: "null_clear",
      upstream: null
    };

    expect(isRequiredNullClearConflict("ANIME", conflict)).toBe(false);
  });

  it("skips blocked required fields when bulk-selecting accept upstream", () => {
    const conflicts = [
      {
        field: "title",
        rule: "null_clear",
        upstream: null
      },
      {
        field: "score",
        rule: "null_clear",
        upstream: null
      }
    ];

    expect(
      buildBulkFieldChoiceMap("ANIME", conflicts, "accept_upstream")
    ).toEqual({
      score: "accept_upstream"
    });
    expect(buildBulkFieldChoiceMap("ANIME", conflicts, "keep_local")).toEqual({
      title: "keep_local",
      score: "keep_local"
    });
  });
});
