export type ImageOriginType = "AI" | "HUMAN";

export type ImageVaultSafetyLevel = "SAFE" | "NSFW" | "EXPLICIT";

export type SensitiveImageVisibility =
  | "SHOW_ALL"
  | "MASK_EXPLICIT"
  | "MASK_NSFW_AND_EXPLICIT";

export const IMAGE_VAULT_SAFETY_LEVELS: readonly ImageVaultSafetyLevel[] = [
  "SAFE",
  "NSFW",
  "EXPLICIT"
] as const;

export const IMAGE_VAULT_SAFETY_LEVEL_LABELS: Record<
  ImageVaultSafetyLevel,
  string
> = {
  SAFE: "Safe",
  NSFW: "NSFW",
  EXPLICIT: "Explicit"
};

export const SENSITIVE_IMAGE_VISIBILITY_OPTIONS: readonly SensitiveImageVisibility[] =
  ["SHOW_ALL", "MASK_EXPLICIT", "MASK_NSFW_AND_EXPLICIT"] as const;

export const SENSITIVE_IMAGE_VISIBILITY_LABELS: Record<
  SensitiveImageVisibility,
  string
> = {
  SHOW_ALL: "Show all",
  MASK_EXPLICIT: "Mask explicit",
  MASK_NSFW_AND_EXPLICIT: "Mask NSFW + explicit"
};

export const parseImageVaultSafetyLevel = (
  value: string
): ImageVaultSafetyLevel | null =>
  IMAGE_VAULT_SAFETY_LEVELS.includes(value as ImageVaultSafetyLevel)
    ? (value as ImageVaultSafetyLevel)
    : null;

export const parseSensitiveImageVisibility = (
  value: string
): SensitiveImageVisibility | null =>
  SENSITIVE_IMAGE_VISIBILITY_OPTIONS.includes(
    value as SensitiveImageVisibility
  )
    ? (value as SensitiveImageVisibility)
    : null;

export const parseImageOriginType = (
  value: string
): ImageOriginType | null =>
  value === "AI" || value === "HUMAN" ? value : null;

export const parseOriginFilter = (
  value: string | null
): ImageOriginType | "all" => {
  if (!value || value === "all") {
    return "all";
  }
  return parseImageOriginType(value) ?? "all";
};

export const parseSafetyFilter = (
  value: string | null
): ImageVaultSafetyLevel | "all" => {
  if (!value || value === "all") {
    return "all";
  }
  return parseImageVaultSafetyLevel(value) ?? "all";
};

export const isExplicitSafetyLevel = (
  safetyLevel: ImageVaultSafetyLevel
): boolean => safetyLevel === "EXPLICIT";

export const isSensitiveSafetyLevel = (
  safetyLevel: ImageVaultSafetyLevel
): boolean => safetyLevel === "NSFW" || safetyLevel === "EXPLICIT";

export const isSafetyReasonInvalid = (
  safetyLevel: ImageVaultSafetyLevel,
  safetyReason: string
): boolean =>
  isExplicitSafetyLevel(safetyLevel) && !safetyReason.trim();

export const normalizeImageVaultSafetyReasonForSubmit = (
  safetyLevel: ImageVaultSafetyLevel,
  safetyReason: string
): string | null => {
  if (safetyLevel === "SAFE") {
    return null;
  }
  const trimmed = safetyReason.trim();
  return trimmed || null;
};

export const IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY = 20;

export type ImageVaultCatalogEditDialogControl = {
  isOpenFor: (entityId: string) => boolean;
  onOpenChange: (entityId: string, open: boolean) => void;
};

export type ImageVaultModel = {
  id: string;
  name: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ImageVaultCategory = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type ImageVaultAssetSummary = {
  id: string;
  mimeType: string;
  fileSize?: number | null;
  width?: number | null;
  height?: number | null;
};

export type ImageVaultSourceAsset = ImageVaultAssetSummary & {
  previewUrl: string;
};

export type ImageLineageSummary = {
  id: string;
  prompt?: string | null;
  originalPrompt?: string | null;
  previewUrl: string;
  safetyLevel: ImageVaultSafetyLevel;
  createdAt: string;
};

export type ImageVaultEntry = {
  id: string;
  assetId: string;
  parentId?: string | null;
  originType: ImageOriginType;
  sourceUrl?: string | null;
  prompt?: string | null;
  originalPrompt?: string | null;
  safetyLevel: ImageVaultSafetyLevel;
  safetyReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  previewUrl: string;
  asset: ImageVaultAssetSummary;
  sourceAsset?: ImageVaultSourceAsset | null;
  rootSourceAsset?: ImageVaultSourceAsset | null;
  model?: ImageVaultModel | null;
  categories: ImageVaultCategory[];
  parent?: ImageLineageSummary | null;
  children?: ImageLineageSummary[];
};

export type ImageVaultListFilters = {
  page: number;
  limit: number;
  search?: string;
  originType?: ImageOriginType;
  modelId?: string;
  categoryId?: string;
  safetyLevel?: ImageVaultSafetyLevel;
};

export type ImageVaultInfiniteListFilters = Omit<
  ImageVaultListFilters,
  "page"
>;

export type CreateImageEntryPayload = {
  assetId: string;
  sourceAssetId?: string;
  parentId?: string;
  originType: ImageOriginType;
  sourceUrl?: string;
  modelId?: string;
  prompt?: string;
  originalPrompt?: string;
  safetyLevel?: ImageVaultSafetyLevel;
  safetyReason?: string | null;
  categoryIds?: string[];
  notes?: string;
};

export type UpdateImageEntryPayload = {
  sourceAssetId?: string | null;
  originType?: ImageOriginType;
  sourceUrl?: string | null;
  modelId?: string | null;
  prompt?: string | null;
  originalPrompt?: string | null;
  safetyLevel?: ImageVaultSafetyLevel;
  safetyReason?: string | null;
  categoryIds?: string[];
  notes?: string | null;
};
