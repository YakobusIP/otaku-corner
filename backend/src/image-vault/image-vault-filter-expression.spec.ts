import { BadRequestException } from "@nestjs/common";

import {
  IMAGE_VAULT_FILTER_OPS_BY_FIELD,
  type ImageVaultFilterField
} from "./dto/image-entry-search.dto";
import {
  ImageOriginTypeDto,
  ImageVaultSafetyLevelDto
} from "./dto/image-vault-enums";
import {
  mapFilterClauseToWhere,
  mapFilterGroupsToWhere
} from "./image-vault-filter-expression";

const UUID_A = "550e8400-e29b-41d4-a716-446655440000";
const UUID_B = "6ba7b810-9dad-41d4-a716-446655440000";

const allowedOps = (field: ImageVaultFilterField): string =>
  IMAGE_VAULT_FILTER_OPS_BY_FIELD[field].join(", ");

const expectBadRequestMessage = (fn: () => unknown, message: string): void => {
  expect(fn).toThrow(BadRequestException);
  expect(fn).toThrow(new BadRequestException(message));
};

describe("mapFilterClauseToWhere", () => {
  describe("operator allowlist", () => {
    it("rejects text operators on model", () => {
      expectBadRequestMessage(
        () =>
          mapFilterClauseToWhere({
            field: "model",
            op: "eq",
            values: [UUID_A]
          }),
        `Operator "eq" is not allowed for field "model". Allowed: ${allowedOps("model")}`
      );
    });

    it("rejects membership operators on prompt", () => {
      expectBadRequestMessage(
        () =>
          mapFilterClauseToWhere({
            field: "prompt",
            op: "in",
            values: ["hello"]
          }),
        `Operator "in" is not allowed for field "prompt". Allowed: ${allowedOps("prompt")}`
      );
    });

    it("rejects contains on originType", () => {
      expectBadRequestMessage(
        () =>
          mapFilterClauseToWhere({
            field: "originType",
            op: "contains",
            values: ["AI"]
          }),
        `Operator "contains" is not allowed for field "originType". Allowed: ${allowedOps("originType")}`
      );
    });
  });

  describe("model (id)", () => {
    it("maps model in to modelId in list", () => {
      expect(
        mapFilterClauseToWhere({
          field: "model",
          op: "in",
          values: [UUID_A, UUID_B]
        })
      ).toEqual({ modelId: { in: [UUID_A, UUID_B] } });
    });

    it("maps model nin to notIn with null", () => {
      expect(
        mapFilterClauseToWhere({
          field: "model",
          op: "nin",
          values: [UUID_A]
        })
      ).toEqual({
        OR: [{ modelId: { notIn: [UUID_A] } }, { modelId: null }]
      });
    });

    it("rejects non-UUID model values", () => {
      expectBadRequestMessage(
        () =>
          mapFilterClauseToWhere({
            field: "model",
            op: "in",
            values: ["not-a-uuid"]
          }),
        'Field "model" expects UUID values; received "not-a-uuid"'
      );
    });
  });

  describe("category (id)", () => {
    it("maps category in to AND of category relations", () => {
      expect(
        mapFilterClauseToWhere({
          field: "category",
          op: "in",
          values: [UUID_A, UUID_B]
        })
      ).toEqual({
        AND: [
          { categories: { some: { imageVaultCategoryId: UUID_A } } },
          { categories: { some: { imageVaultCategoryId: UUID_B } } }
        ]
      });
    });

    it("maps category nin to none matching any listed id", () => {
      expect(
        mapFilterClauseToWhere({
          field: "category",
          op: "nin",
          values: [UUID_A, UUID_B]
        })
      ).toEqual({
        categories: {
          none: { imageVaultCategoryId: { in: [UUID_A, UUID_B] } }
        }
      });
    });

    it("rejects non-UUID category values", () => {
      expectBadRequestMessage(
        () =>
          mapFilterClauseToWhere({
            field: "category",
            op: "in",
            values: [UUID_A, "bad"]
          }),
        'Field "category" expects UUID values; received "bad"'
      );
    });
  });

  describe("originType (enum)", () => {
    it("maps originType in to column in list", () => {
      expect(
        mapFilterClauseToWhere({
          field: "originType",
          op: "in",
          values: ["AI", "HUMAN"]
        })
      ).toEqual({ originType: { in: ["AI", "HUMAN"] } });
    });

    it("maps originType nin to notIn", () => {
      expect(
        mapFilterClauseToWhere({
          field: "originType",
          op: "nin",
          values: ["HUMAN"]
        })
      ).toEqual({ originType: { notIn: ["HUMAN"] } });
    });

    it("rejects invalid originType values", () => {
      expectBadRequestMessage(
        () =>
          mapFilterClauseToWhere({
            field: "originType",
            op: "in",
            values: ["ROBOT"]
          }),
        `Field "originType" received invalid value "ROBOT". Allowed: ${Object.values(ImageOriginTypeDto).join(", ")}`
      );
    });
  });

  describe("safetyLevel (enum)", () => {
    it("maps safetyLevel in to column in list", () => {
      expect(
        mapFilterClauseToWhere({
          field: "safetyLevel",
          op: "in",
          values: ["SAFE", "NSFW"]
        })
      ).toEqual({ safetyLevel: { in: ["SAFE", "NSFW"] } });
    });

    it("maps safetyLevel nin to notIn", () => {
      expect(
        mapFilterClauseToWhere({
          field: "safetyLevel",
          op: "nin",
          values: ["EXPLICIT"]
        })
      ).toEqual({ safetyLevel: { notIn: ["EXPLICIT"] } });
    });

    it("rejects invalid safetyLevel values", () => {
      expectBadRequestMessage(
        () =>
          mapFilterClauseToWhere({
            field: "safetyLevel",
            op: "in",
            values: ["MILD"]
          }),
        `Field "safetyLevel" received invalid value "MILD". Allowed: ${Object.values(ImageVaultSafetyLevelDto).join(", ")}`
      );
    });
  });

  describe("prompt (text)", () => {
    it("maps eq to case-insensitive equals", () => {
      expect(
        mapFilterClauseToWhere({
          field: "prompt",
          op: "eq",
          values: ["  hello  "]
        })
      ).toEqual({ prompt: { equals: "hello", mode: "insensitive" } });
    });

    it("maps neq to not equals or null", () => {
      expect(
        mapFilterClauseToWhere({
          field: "prompt",
          op: "neq",
          values: ["hello"]
        })
      ).toEqual({
        OR: [
          { prompt: { not: { equals: "hello", mode: "insensitive" } } },
          { prompt: null }
        ]
      });
    });

    it("maps contains to case-insensitive substring", () => {
      expect(
        mapFilterClauseToWhere({
          field: "prompt",
          op: "contains",
          values: ["wave"]
        })
      ).toEqual({ prompt: { contains: "wave", mode: "insensitive" } });
    });

    it("maps not_contains to negated contains or null", () => {
      expect(
        mapFilterClauseToWhere({
          field: "prompt",
          op: "not_contains",
          values: ["wave"]
        })
      ).toEqual({
        OR: [
          { NOT: { prompt: { contains: "wave", mode: "insensitive" } } },
          { prompt: null }
        ]
      });
    });

    it("rejects multiple text values", () => {
      expectBadRequestMessage(
        () =>
          mapFilterClauseToWhere({
            field: "prompt",
            op: "eq",
            values: ["a", "b"]
          }),
        'Field "prompt" requires exactly one value for comparison operators'
      );
    });

    it("rejects whitespace-only text values", () => {
      expectBadRequestMessage(
        () =>
          mapFilterClauseToWhere({
            field: "prompt",
            op: "eq",
            values: ["   "]
          }),
        'Field "prompt" value must not be empty or whitespace-only'
      );
    });

    it("maps other text fields to their column names", () => {
      expect(
        mapFilterClauseToWhere({
          field: "originalPrompt",
          op: "eq",
          values: ["seed"]
        })
      ).toEqual({
        originalPrompt: { equals: "seed", mode: "insensitive" }
      });
    });
  });
});

describe("mapFilterGroupsToWhere", () => {
  it("returns empty object when groups are undefined", () => {
    expect(mapFilterGroupsToWhere(undefined)).toEqual({});
  });

  it("returns empty object when groups array is empty", () => {
    expect(mapFilterGroupsToWhere([])).toEqual({});
  });

  it("rejects a group with no clauses", () => {
    expectBadRequestMessage(
      () => mapFilterGroupsToWhere([{ clauses: [] }]),
      "Each filter group must include clauses"
    );
  });

  it("rejects a group with missing clauses", () => {
    expectBadRequestMessage(
      () => mapFilterGroupsToWhere([{ clauses: undefined as unknown as [] }]),
      "Each filter group must include clauses"
    );
  });

  it("returns a single clause group without extra wrapping", () => {
    expect(
      mapFilterGroupsToWhere([
        {
          clauses: [{ field: "originType", op: "in", values: ["AI"] }]
        }
      ])
    ).toEqual({ originType: { in: ["AI"] } });
  });

  it("ORs multiple clauses within one group", () => {
    expect(
      mapFilterGroupsToWhere([
        {
          clauses: [
            { field: "originType", op: "in", values: ["AI"] },
            { field: "safetyLevel", op: "in", values: ["SAFE"] }
          ]
        }
      ])
    ).toEqual({
      OR: [{ originType: { in: ["AI"] } }, { safetyLevel: { in: ["SAFE"] } }]
    });
  });

  it("ANDs multiple groups", () => {
    expect(
      mapFilterGroupsToWhere([
        {
          clauses: [{ field: "originType", op: "in", values: ["AI"] }]
        },
        {
          clauses: [{ field: "safetyLevel", op: "in", values: ["SAFE"] }]
        }
      ])
    ).toEqual({
      AND: [{ originType: { in: ["AI"] } }, { safetyLevel: { in: ["SAFE"] } }]
    });
  });
});
