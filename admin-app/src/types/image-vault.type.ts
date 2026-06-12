export type ImageOriginType = "AI" | "HUMAN";

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
  isExplicit: boolean;
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
  isExplicit: boolean;
  explicitReason?: string | null;
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
  isExplicit?: boolean;
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
  isExplicit?: boolean;
  explicitReason?: string;
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
  isExplicit?: boolean;
  explicitReason?: string | null;
  categoryIds?: string[];
  notes?: string | null;
};
