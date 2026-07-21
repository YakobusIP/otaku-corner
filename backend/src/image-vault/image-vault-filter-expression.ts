import { BadRequestException } from "@nestjs/common";

import {
  IMAGE_VAULT_ENUM_FILTER_FIELDS,
  IMAGE_VAULT_FILTER_OPS_BY_FIELD,
  IMAGE_VAULT_ID_FILTER_FIELDS,
  IMAGE_VAULT_TEXT_FILTER_FIELDS,
  type ImageVaultFilterClauseDto,
  type ImageVaultFilterField,
  type ImageVaultFilterGroupDto,
  type ImageVaultFilterOp
} from "@/image-vault/dto/image-entry-search.dto";
import {
  ImageOriginTypeDto,
  ImageVaultSafetyLevelDto
} from "@/image-vault/dto/image-vault-enums";

import { Prisma } from "@prisma/client";
import { isUUID } from "class-validator";

const ORIGIN_VALUES = new Set<string>(Object.values(ImageOriginTypeDto));
const SAFETY_VALUES = new Set<string>(Object.values(ImageVaultSafetyLevelDto));

const isIdFilterField = (
  field: ImageVaultFilterField
): field is (typeof IMAGE_VAULT_ID_FILTER_FIELDS)[number] =>
  (IMAGE_VAULT_ID_FILTER_FIELDS as readonly string[]).includes(field);

const isEnumFilterField = (
  field: ImageVaultFilterField
): field is (typeof IMAGE_VAULT_ENUM_FILTER_FIELDS)[number] =>
  (IMAGE_VAULT_ENUM_FILTER_FIELDS as readonly string[]).includes(field);

const isTextFilterField = (
  field: ImageVaultFilterField
): field is (typeof IMAGE_VAULT_TEXT_FILTER_FIELDS)[number] =>
  (IMAGE_VAULT_TEXT_FILTER_FIELDS as readonly string[]).includes(field);

const assertOpAllowed = (
  field: ImageVaultFilterField,
  op: ImageVaultFilterOp
): void => {
  const allowed = IMAGE_VAULT_FILTER_OPS_BY_FIELD[field];
  if (!allowed.includes(op)) {
    throw new BadRequestException(
      `Operator "${op}" is not allowed for field "${field}". Allowed: ${allowed.join(", ")}`
    );
  }
};

const assertUuidValues = (
  field: ImageVaultFilterField,
  values: string[]
): void => {
  for (const value of values) {
    if (!isUUID(value, "4")) {
      throw new BadRequestException(
        `Field "${field}" expects UUID values; received "${value}"`
      );
    }
  }
};

const assertEnumValues = <T extends string>(
  field: (typeof IMAGE_VAULT_ENUM_FILTER_FIELDS)[number],
  values: string[],
  allowed: ReadonlySet<string>
): T[] => {
  for (const value of values) {
    if (!allowed.has(value)) {
      throw new BadRequestException(
        `Field "${field}" received invalid value "${value}". Allowed: ${[...allowed].join(", ")}`
      );
    }
  }
  return values as T[];
};

const assertTextValues = (
  field: ImageVaultFilterField,
  values: string[]
): string => {
  if (values.length !== 1) {
    throw new BadRequestException(
      `Field "${field}" requires exactly one value for comparison operators`
    );
  }
  const trimmed = values[0].trim();
  if (!trimmed) {
    throw new BadRequestException(
      `Field "${field}" value must not be empty or whitespace-only`
    );
  }
  return trimmed;
};

const mapTextClause = (
  field: (typeof IMAGE_VAULT_TEXT_FILTER_FIELDS)[number],
  op: ImageVaultFilterOp,
  rawValues: string[]
): Prisma.ImageVaultEntryWhereInput => {
  const value = assertTextValues(field, rawValues);
  const column = field;

  switch (op) {
    case "eq":
      return { [column]: { equals: value, mode: "insensitive" } };
    case "neq":
      return {
        OR: [
          { [column]: { not: { equals: value, mode: "insensitive" } } },
          { [column]: null }
        ]
      };
    case "contains":
      return { [column]: { contains: value, mode: "insensitive" } };
    case "not_contains":
      return {
        OR: [
          { NOT: { [column]: { contains: value, mode: "insensitive" } } },
          { [column]: null }
        ]
      };
    default:
      throw new BadRequestException(
        `Operator "${op}" is not supported for text field "${field}"`
      );
  }
};

const mapModelClause = (
  op: ImageVaultFilterOp,
  values: string[]
): Prisma.ImageVaultEntryWhereInput => {
  assertUuidValues("model", values);
  if (op === "in") {
    return { modelId: { in: values } };
  }
  return {
    OR: [{ modelId: { notIn: values } }, { modelId: null }]
  };
};

const mapCategoryClause = (
  op: ImageVaultFilterOp,
  values: string[]
): Prisma.ImageVaultEntryWhereInput => {
  assertUuidValues("category", values);
  // Multi-valued tags: Multiselect "in" means has ALL selected categories.
  // Use explicit OR clauses in the filter bar for any-of matching.
  if (op === "in") {
    return {
      AND: values.map((imageVaultCategoryId) => ({
        categories: {
          some: { imageVaultCategoryId }
        }
      }))
    };
  }
  // "nin" means has NONE of the selected categories.
  return {
    categories: {
      none: { imageVaultCategoryId: { in: values } }
    }
  };
};

const mapEnumInNinClause = <T extends string>(
  column: "originType" | "safetyLevel",
  op: ImageVaultFilterOp,
  values: T[]
): Prisma.ImageVaultEntryWhereInput => {
  if (op === "in") {
    return { [column]: { in: values } };
  }
  return { [column]: { notIn: values } };
};

export const mapFilterClauseToWhere = (
  clause: ImageVaultFilterClauseDto
): Prisma.ImageVaultEntryWhereInput => {
  const { field, op, values } = clause;
  assertOpAllowed(field, op);

  if (isIdFilterField(field)) {
    if (field === "model") {
      return mapModelClause(op, values);
    }
    return mapCategoryClause(op, values);
  }

  if (isEnumFilterField(field)) {
    if (field === "originType") {
      return mapEnumInNinClause(
        "originType",
        op,
        assertEnumValues<ImageOriginTypeDto>(
          "originType",
          values,
          ORIGIN_VALUES
        )
      );
    }
    return mapEnumInNinClause(
      "safetyLevel",
      op,
      assertEnumValues<ImageVaultSafetyLevelDto>(
        "safetyLevel",
        values,
        SAFETY_VALUES
      )
    );
  }

  if (isTextFilterField(field)) {
    return mapTextClause(field, op, values);
  }

  throw new BadRequestException("Unsupported filter field");
};

export const mapFilterGroupsToWhere = (
  groups: ImageVaultFilterGroupDto[] | undefined
): Prisma.ImageVaultEntryWhereInput => {
  if (!groups || groups.length === 0) {
    return {};
  }

  const andGroups: Prisma.ImageVaultEntryWhereInput[] = groups.map((group) => {
    if (!group.clauses || group.clauses.length === 0) {
      throw new BadRequestException("Each filter group must include clauses");
    }
    if (group.clauses.length === 1) {
      return mapFilterClauseToWhere(group.clauses[0]);
    }
    return {
      OR: group.clauses.map((clause) => mapFilterClauseToWhere(clause))
    };
  });

  if (andGroups.length === 1) {
    return andGroups[0];
  }

  return { AND: andGroups };
};
