import type {
  ImageOriginType,
  ImageVaultSafetyLevel
} from "@/types/image-vault.type";
import {
  IMAGE_VAULT_SAFETY_LEVEL_LABELS,
  IMAGE_VAULT_SAFETY_LEVELS
} from "@/types/image-vault.type";

export const IMAGE_VAULT_FILTER_FIELDS = [
  "model",
  "category",
  "originType",
  "safetyLevel",
  "prompt",
  "originalPrompt",
  "sourceUrl",
  "notes"
] as const;

export type ImageVaultFilterField = (typeof IMAGE_VAULT_FILTER_FIELDS)[number];

/** Keep field/op contract in sync with backend `image-entry-search.dto.ts`. */
export const IMAGE_VAULT_FILTER_OPS = [
  "in",
  "nin",
  "eq",
  "neq",
  "contains",
  "not_contains"
] as const;

export type ImageVaultFilterOp = (typeof IMAGE_VAULT_FILTER_OPS)[number];

export type ImageVaultFilterValueKind = "id" | "enum" | "text";

export type ImageVaultFilterClause = {
  id: string;
  field: ImageVaultFilterField;
  op: ImageVaultFilterOp;
  values: string[];
};

export type ImageVaultFilterGroup = {
  id: string;
  clauses: ImageVaultFilterClause[];
};

/** Wire shape sent to POST /images/search (no client-only clause ids). */
export type ImageVaultFilterClausePayload = {
  field: ImageVaultFilterField;
  op: ImageVaultFilterOp;
  values: string[];
};

export type ImageVaultFilterGroupPayload = {
  clauses: ImageVaultFilterClausePayload[];
};

export type ImageVaultFilterFieldConfig = {
  field: ImageVaultFilterField;
  label: string;
  valueKind: ImageVaultFilterValueKind;
  operators: readonly ImageVaultFilterOp[];
  enumOptions?: ReadonlyArray<{ value: string; label: string }>;
};

export const IMAGE_VAULT_FILTER_OP_LABELS: Record<ImageVaultFilterOp, string> = {
  in: "is",
  nin: "is not",
  eq: "=",
  neq: "!=",
  contains: "contains",
  not_contains: "does not contain"
};

/** Category is multi-valued; Multiselect "in" means has all selected tags. */
export const IMAGE_VAULT_CATEGORY_FILTER_OP_LABELS: Record<
  "in" | "nin",
  string
> = {
  in: "has all",
  nin: "has none"
};

export const getFilterOpLabel = (
  field: ImageVaultFilterField,
  op: ImageVaultFilterOp
): string => {
  if (field === "category" && (op === "in" || op === "nin")) {
    return IMAGE_VAULT_CATEGORY_FILTER_OP_LABELS[op];
  }
  return IMAGE_VAULT_FILTER_OP_LABELS[op];
};

export const IMAGE_VAULT_FILTER_FIELD_CONFIG: Record<
  ImageVaultFilterField,
  ImageVaultFilterFieldConfig
> = {
  model: {
    field: "model",
    label: "Model",
    valueKind: "id",
    operators: ["in", "nin"]
  },
  category: {
    field: "category",
    label: "Category",
    valueKind: "id",
    operators: ["in", "nin"]
  },
  originType: {
    field: "originType",
    label: "Origin",
    valueKind: "enum",
    operators: ["in", "nin"],
    enumOptions: [
      { value: "AI" satisfies ImageOriginType, label: "AI" },
      { value: "HUMAN" satisfies ImageOriginType, label: "Human" }
    ]
  },
  safetyLevel: {
    field: "safetyLevel",
    label: "Safety",
    valueKind: "enum",
    operators: ["in", "nin"],
    enumOptions: IMAGE_VAULT_SAFETY_LEVELS.map((level) => ({
      value: level satisfies ImageVaultSafetyLevel,
      label: IMAGE_VAULT_SAFETY_LEVEL_LABELS[level]
    }))
  },
  prompt: {
    field: "prompt",
    label: "Prompt",
    valueKind: "text",
    operators: ["eq", "neq", "contains", "not_contains"]
  },
  originalPrompt: {
    field: "originalPrompt",
    label: "Original prompt",
    valueKind: "text",
    operators: ["eq", "neq", "contains", "not_contains"]
  },
  sourceUrl: {
    field: "sourceUrl",
    label: "Source URL",
    valueKind: "text",
    operators: ["eq", "neq", "contains", "not_contains"]
  },
  notes: {
    field: "notes",
    label: "Notes",
    valueKind: "text",
    operators: ["eq", "neq", "contains", "not_contains"]
  }
};

export const IMAGE_VAULT_FILTER_FIELD_OPTIONS = IMAGE_VAULT_FILTER_FIELDS.map(
  (field) => IMAGE_VAULT_FILTER_FIELD_CONFIG[field]
);

export const createFilterId = (): string => crypto.randomUUID();

export const createEmptyClause = (
  field: ImageVaultFilterField
): ImageVaultFilterClause => {
  const config = IMAGE_VAULT_FILTER_FIELD_CONFIG[field];
  return {
    id: createFilterId(),
    field,
    op: config.operators[0],
    values: []
  };
};

export const createGroupWithClause = (
  field: ImageVaultFilterField
): ImageVaultFilterGroup => ({
  id: createFilterId(),
  clauses: [createEmptyClause(field)]
});

export const isClauseComplete = (clause: ImageVaultFilterClause): boolean => {
  const config = IMAGE_VAULT_FILTER_FIELD_CONFIG[clause.field];
  if (config.valueKind === "text") {
    return clause.values.length === 1 && clause.values[0].trim().length > 0;
  }
  return clause.values.length > 0;
};

export const sanitizeFilterGroupsForRequest = (
  groups: ImageVaultFilterGroup[]
): ImageVaultFilterGroupPayload[] =>
  groups
    .map((group) => ({
      clauses: group.clauses
        .filter(isClauseComplete)
        .map(({ field, op, values }) => ({
          field,
          op,
          values:
            IMAGE_VAULT_FILTER_FIELD_CONFIG[field].valueKind === "text"
              ? [values[0].trim()]
              : values
        }))
    }))
    .filter((group) => group.clauses.length > 0);

export const hasActiveFilterGroups = (
  groups: ImageVaultFilterGroup[]
): boolean => sanitizeFilterGroupsForRequest(groups).length > 0;
