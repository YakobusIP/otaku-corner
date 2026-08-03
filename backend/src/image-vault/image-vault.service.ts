import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { AssetsService } from "@/assets/assets.service";
import type { CreateImageEntryDto } from "@/image-vault/dto/create-image-entry.dto";
import type {
  ImageEntryResponseDto,
  ImageLineageSummaryDto,
  ImageVaultSourceAssetDto,
  PaginatedImageEntriesResponseDto
} from "@/image-vault/dto/image-entry-response.dto";
import type { ImageEntrySearchDto } from "@/image-vault/dto/image-entry-search.dto";
import {
  ImageOriginTypeDto,
  ImageVaultSafetyLevelDto
} from "@/image-vault/dto/image-vault-enums";
import type { UpdateImageEntryDto } from "@/image-vault/dto/update-image-entry.dto";
import { ImageVaultCategoryService } from "@/image-vault/image-vault-category.service";
import { mapFilterGroupsToWhere } from "@/image-vault/image-vault-filter-expression";
import { ImageVaultModelService } from "@/image-vault/image-vault-model.service";
import {
  IMAGE_VAULT_DEFAULT_PAGE_LIMIT,
  IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY,
  IMAGE_VAULT_MAX_SOURCE_ASSETS_PER_ENTRY
} from "@/image-vault/image-vault.constants";
import { isPrivateVaultAssetUrl } from "@/storage/asset-storage-scope";
import { R2FileStorageService } from "@/storage/r2-file-storage.service";

import {
  type Asset,
  AssetStatus,
  type ImageVaultEntry,
  type ImageVaultEntryCategory,
  type ImageVaultEntrySourceAsset,
  type ImageVaultGenerationModel,
  ImageVaultOriginType,
  ImageVaultSafetyLevel,
  Prisma
} from "@prisma/client";

const IMAGE_VAULT_DOWNLOAD_PRESIGNED_EXPIRES_SECONDS = 300;

const IMAGE_VAULT_MIME_TYPE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp"
};

type ImageVaultEntryCategoryWithCategory = ImageVaultEntryCategory & {
  imageVaultCategory: {
    id: string;
    name: string;
    slug: string;
  };
};

type ImageVaultEntrySourceAssetWithAsset = ImageVaultEntrySourceAsset & {
  asset: Asset;
};

type ImageVaultEntryWithRelations = ImageVaultEntry & {
  asset: Asset;
  sourceAssets?: ImageVaultEntrySourceAssetWithAsset[];
  model: ImageVaultGenerationModel | null;
  categories: ImageVaultEntryCategoryWithCategory[];
  parent?: (ImageVaultEntry & { asset: Asset }) | null;
  children?: (ImageVaultEntry & { asset: Asset })[];
};

@Injectable()
export class ImageVaultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2FileStorageService,
    private readonly assetsService: AssetsService,
    private readonly imageVaultModelService: ImageVaultModelService,
    private readonly imageVaultCategoryService: ImageVaultCategoryService
  ) {}

  async createImageEntry(
    dto: CreateImageEntryDto
  ): Promise<ImageEntryResponseDto> {
    this.validateOriginFields(dto.originType, {
      modelId: dto.modelId,
      prompt: dto.prompt,
      sourceUrl: dto.sourceUrl,
      originalPrompt: dto.originalPrompt
    });
    const safetyLevel =
      (dto.safetyLevel as ImageVaultSafetyLevel | undefined) ??
      ImageVaultSafetyLevel.SAFE;
    const safetyReason = this.normalizeSafetyReason(
      safetyLevel,
      dto.safetyReason
    );
    this.validateOriginalPrompt(dto.prompt, dto.originalPrompt);

    const sourceAssetIds = this.normalizeSourceAssetIds(dto.sourceAssetIds);

    if (dto.parentId && sourceAssetIds.length > 0) {
      throw new BadRequestException(
        "Follow-up images cannot include source images"
      );
    }

    await this.assertParentExists(dto.parentId);

    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
      include: { imageVaultEntry: true }
    });

    if (!asset) {
      throw new NotFoundException(`Asset "${dto.assetId}" not found`);
    }

    if (!isPrivateVaultAssetUrl(asset.url)) {
      throw new BadRequestException(
        "Asset is not an Image Vault private upload"
      );
    }

    if (asset.imageVaultEntry) {
      throw new ConflictException("Asset already linked to an image entry");
    }

    if (asset.status !== AssetStatus.READY) {
      throw new BadRequestException(
        "Asset upload is not complete; call POST /assets/:assetId/complete first"
      );
    }

    await this.assertSourceAssetsReady(sourceAssetIds, dto.assetId);

    const categoryIds = this.normalizeCategoryIds(dto.categoryIds);
    await this.assertOptionalRelationsExist(dto.modelId, categoryIds);

    const entry = await this.prisma.imageVaultEntry.create({
      data: {
        assetId: dto.assetId,
        parentId: dto.parentId ?? null,
        originType: dto.originType as ImageVaultOriginType,
        sourceUrl: dto.sourceUrl ?? null,
        modelId: dto.modelId ?? null,
        prompt: dto.prompt ?? null,
        originalPrompt: dto.originalPrompt ?? null,
        safetyLevel,
        safetyReason,
        notes: dto.notes ?? null,
        ...(categoryIds.length > 0
          ? {
              categories: {
                create: categoryIds.map((imageVaultCategoryId) => ({
                  imageVaultCategoryId
                }))
              }
            }
          : {}),
        ...(sourceAssetIds.length > 0
          ? {
              sourceAssets: {
                create: sourceAssetIds.map((sourceAssetId, index) => ({
                  assetId: sourceAssetId,
                  sortOrder: index
                }))
              }
            }
          : {})
      },
      include: this.entryInclude()
    });

    return this.mapEntry(entry);
  }

  async searchImages(
    dto: ImageEntrySearchDto
  ): Promise<PaginatedImageEntriesResponseDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? IMAGE_VAULT_DEFAULT_PAGE_LIMIT;
    const where = mapFilterGroupsToWhere(dto.groups);

    return this.paginateImages(where, page, limit);
  }

  private async paginateImages(
    where: Prisma.ImageVaultEntryWhereInput,
    page: number,
    limit: number
  ): Promise<PaginatedImageEntriesResponseDto> {
    const [rows, total] = await Promise.all([
      this.prisma.imageVaultEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: this.listEntryInclude()
      }),
      this.prisma.imageVaultEntry.count({ where })
    ]);

    const data = await Promise.all(
      rows.map((row) => this.mapEntry(row, false, false))
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0
    };
  }

  async findImageById(id: string): Promise<ImageEntryResponseDto> {
    const entry = await this.prisma.imageVaultEntry.findUnique({
      where: { id },
      include: {
        ...this.entryInclude(),
        parent: { include: { asset: true } },
        children: {
          include: { asset: true },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!entry) {
      throw new NotFoundException(`Image entry "${id}" not found`);
    }

    return this.mapEntry(entry, true);
  }

  async updateImage(
    id: string,
    dto: UpdateImageEntryDto
  ): Promise<ImageEntryResponseDto> {
    const existing = await this.prisma.imageVaultEntry.findUnique({
      where: { id },
      select: {
        assetId: true,
        parentId: true,
        originType: true,
        modelId: true,
        prompt: true,
        sourceUrl: true,
        safetyLevel: true,
        safetyReason: true,
        originalPrompt: true,
        sourceAssets: {
          select: { assetId: true },
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (!existing) {
      throw new NotFoundException(`Image entry "${id}" not found`);
    }

    const nextSourceAssetIds =
      dto.sourceAssetIds !== undefined
        ? this.normalizeSourceAssetIds(dto.sourceAssetIds)
        : undefined;

    if (nextSourceAssetIds !== undefined) {
      if (existing.parentId) {
        throw new BadRequestException(
          "Source images can only be attached to root image vault entries"
        );
      }
      await this.assertSourceAssetsReady(
        nextSourceAssetIds,
        existing.assetId,
        id
      );
    }

    const originType = (dto.originType ??
      existing.originType) as ImageOriginTypeDto;
    const modelId = dto.modelId !== undefined ? dto.modelId : existing.modelId;
    const prompt = dto.prompt !== undefined ? dto.prompt : existing.prompt;
    const sourceUrl =
      dto.sourceUrl !== undefined ? dto.sourceUrl : existing.sourceUrl;
    const safetyLevel =
      dto.safetyLevel !== undefined
        ? (dto.safetyLevel as ImageVaultSafetyLevel)
        : existing.safetyLevel;
    const safetyReasonInput =
      dto.safetyReason !== undefined ? dto.safetyReason : existing.safetyReason;
    const safetyReason = this.normalizeSafetyReason(
      safetyLevel,
      safetyReasonInput
    );
    const originalPrompt =
      dto.originalPrompt !== undefined
        ? dto.originalPrompt
        : existing.originalPrompt;

    this.validateOriginFields(originType, {
      modelId,
      prompt,
      sourceUrl,
      originalPrompt
    });
    this.validateOriginalPrompt(
      prompt ?? undefined,
      originalPrompt ?? undefined
    );

    const categoryIds =
      dto.categoryIds !== undefined
        ? this.normalizeCategoryIds(dto.categoryIds)
        : undefined;
    await this.assertOptionalRelationsExist(dto.modelId, categoryIds);

    const previousSourceAssetIds = existing.sourceAssets.map(
      (link) => link.assetId
    );

    const updated = await this.prisma.imageVaultEntry.update({
      where: { id },
      data: {
        originType: dto.originType as ImageVaultOriginType | undefined,
        sourceUrl: dto.sourceUrl,
        modelId: dto.modelId,
        prompt: dto.prompt,
        originalPrompt: dto.originalPrompt,
        safetyLevel: dto.safetyLevel as ImageVaultSafetyLevel | undefined,
        safetyReason:
          dto.safetyLevel !== undefined || dto.safetyReason !== undefined
            ? safetyReason
            : undefined,
        notes: dto.notes,
        ...(categoryIds !== undefined
          ? {
              categories: {
                deleteMany: {},
                create: categoryIds.map((imageVaultCategoryId) => ({
                  imageVaultCategoryId
                }))
              }
            }
          : {}),
        ...(nextSourceAssetIds !== undefined
          ? {
              sourceAssets: {
                deleteMany: {},
                create: nextSourceAssetIds.map((assetId, index) => ({
                  assetId,
                  sortOrder: index
                }))
              }
            }
          : {})
      },
      include: this.entryInclude()
    });

    if (nextSourceAssetIds !== undefined) {
      const nextSet = new Set(nextSourceAssetIds);
      const removedSourceAssetIds = previousSourceAssetIds.filter(
        (assetId) => !nextSet.has(assetId)
      );
      await Promise.all(
        removedSourceAssetIds.map((assetId) =>
          this.assetsService.delete(assetId)
        )
      );
    }

    return this.mapEntry(updated);
  }

  async deleteImage(id: string): Promise<void> {
    const entry = await this.prisma.imageVaultEntry.findUnique({
      where: { id },
      select: {
        assetId: true,
        sourceAssets: { select: { assetId: true } },
        _count: { select: { children: true } }
      }
    });

    if (!entry) {
      throw new NotFoundException(`Image entry "${id}" not found`);
    }

    if (entry._count.children > 0) {
      throw new BadRequestException(
        "Cannot delete an image that has follow-up children"
      );
    }

    const sourceAssetIds = entry.sourceAssets.map((link) => link.assetId);

    await this.assetsService.delete(entry.assetId, {
      allowImageVaultLinkedAsset: true
    });

    await Promise.all(
      sourceAssetIds.map((assetId) => this.assetsService.delete(assetId))
    );
  }

  async getImageDownloadUrl(id: string): Promise<string> {
    const entry = await this.prisma.imageVaultEntry.findUnique({
      where: { id },
      include: { asset: true }
    });

    if (!entry) {
      throw new NotFoundException(`Image entry "${id}" not found`);
    }

    const filename = this.buildDownloadFilename(entry.id, entry.asset.mimeType);

    return this.r2.getPrivatePresignedGetUrl({
      key: entry.asset.storageKey,
      expiresInSeconds: IMAGE_VAULT_DOWNLOAD_PRESIGNED_EXPIRES_SECONDS,
      responseContentDisposition: this.buildAttachmentDisposition(filename),
      meta: {
        image_entry_id: id,
        asset_id: entry.assetId,
        role: "download"
      }
    });
  }

  async getSourceImageDownloadUrl(
    id: string,
    assetId: string
  ): Promise<string> {
    const entry = await this.prisma.imageVaultEntry.findUnique({
      where: { id },
      include: {
        sourceAssets: {
          include: { asset: true },
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (!entry) {
      throw new NotFoundException(`Image entry "${id}" not found`);
    }

    const directMatch = entry.sourceAssets.find(
      (link) => link.assetId === assetId
    );
    const sourceAsset =
      directMatch?.asset ??
      (await this.resolveRootSourceAssets(id)).find(
        (asset) => asset.id === assetId
      );

    if (!sourceAsset) {
      throw new NotFoundException(
        `Source image "${assetId}" not found for entry "${id}"`
      );
    }

    const filename = this.buildDownloadFilename(
      sourceAsset.id,
      sourceAsset.mimeType
    );

    return this.r2.getPrivatePresignedGetUrl({
      key: sourceAsset.storageKey,
      expiresInSeconds: IMAGE_VAULT_DOWNLOAD_PRESIGNED_EXPIRES_SECONDS,
      responseContentDisposition: this.buildAttachmentDisposition(filename),
      meta: {
        image_entry_id: id,
        asset_id: sourceAsset.id,
        role: "source_download"
      }
    });
  }

  private entryInclude() {
    return {
      asset: true,
      sourceAssets: {
        include: { asset: true },
        orderBy: { sortOrder: "asc" as const }
      },
      model: true,
      categories: {
        include: {
          imageVaultCategory: true
        }
      }
    } as const;
  }

  private listEntryInclude() {
    return {
      asset: true,
      model: true,
      categories: {
        include: {
          imageVaultCategory: true
        }
      }
    } as const;
  }

  private validateOriginFields(
    originType: ImageOriginTypeDto,
    fields: {
      modelId?: string | null;
      prompt?: string | null;
      sourceUrl?: string | null;
      originalPrompt?: string | null;
    }
  ): void {
    const hasSourceUrl = Boolean(fields.sourceUrl?.trim());
    const hasModelId = Boolean(fields.modelId);
    const hasPrompt = Boolean(fields.prompt?.trim());
    const hasOriginalPrompt = Boolean(fields.originalPrompt?.trim());

    if (originType === ImageOriginTypeDto.AI) {
      if (!hasModelId) {
        throw new BadRequestException("AI images require modelId");
      }
      if (!hasPrompt) {
        throw new BadRequestException("AI images require prompt");
      }
      if (hasSourceUrl) {
        throw new BadRequestException("AI images must not include sourceUrl");
      }
      return;
    }

    if (hasModelId) {
      throw new BadRequestException("Human images must not include modelId");
    }
    if (hasPrompt) {
      throw new BadRequestException("Human images must not include prompt");
    }
    if (hasOriginalPrompt) {
      throw new BadRequestException(
        "Human images must not include originalPrompt"
      );
    }
  }

  private normalizeSafetyReason(
    safetyLevel: ImageVaultSafetyLevel,
    safetyReason?: string | null
  ): string | null {
    const trimmed = safetyReason?.trim() ?? "";

    if (safetyLevel === ImageVaultSafetyLevel.EXPLICIT) {
      if (!trimmed) {
        throw new BadRequestException(
          "safetyReason is required when safetyLevel is EXPLICIT"
        );
      }
      return trimmed;
    }

    if (safetyLevel === ImageVaultSafetyLevel.SAFE) {
      return null;
    }

    return trimmed || null;
  }

  private validateOriginalPrompt(
    prompt?: string | null,
    originalPrompt?: string | null
  ): void {
    if (originalPrompt?.trim() && !prompt?.trim()) {
      throw new BadRequestException("originalPrompt requires prompt to be set");
    }
  }

  private normalizeUniqueIds(
    ids: string[] | undefined,
    max: number,
    tooManyMessage: string
  ): string[] {
    if (!ids?.length) {
      return [];
    }

    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const id of ids) {
      if (!seen.has(id)) {
        seen.add(id);
        normalized.push(id);
      }
    }

    if (normalized.length > max) {
      throw new BadRequestException(tooManyMessage);
    }

    return normalized;
  }

  private normalizeCategoryIds(categoryIds?: string[]): string[] {
    return this.normalizeUniqueIds(
      categoryIds,
      IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY,
      `At most ${IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY} categories per image`
    );
  }

  private normalizeSourceAssetIds(sourceAssetIds?: string[]): string[] {
    return this.normalizeUniqueIds(
      sourceAssetIds,
      IMAGE_VAULT_MAX_SOURCE_ASSETS_PER_ENTRY,
      `At most ${IMAGE_VAULT_MAX_SOURCE_ASSETS_PER_ENTRY} source images per entry`
    );
  }

  private async assertParentExists(parentId?: string): Promise<void> {
    if (!parentId) {
      return;
    }

    const parent = await this.prisma.imageVaultEntry.findUnique({
      where: { id: parentId },
      select: { id: true }
    });

    if (!parent) {
      throw new NotFoundException(`Parent image "${parentId}" not found`);
    }
  }

  private async assertSourceAssetsReady(
    sourceAssetIds: string[],
    catalogAssetId: string,
    entryId?: string
  ): Promise<void> {
    if (sourceAssetIds.length === 0) {
      return;
    }

    for (const sourceAssetId of sourceAssetIds) {
      if (sourceAssetId === catalogAssetId) {
        throw new BadRequestException(
          "Source image must differ from the catalog image"
        );
      }
    }

    const assets = await this.prisma.asset.findMany({
      where: { id: { in: sourceAssetIds } },
      include: {
        imageVaultEntry: { select: { id: true } },
        imageVaultSourceLinks: { select: { imageVaultEntryId: true } }
      }
    });
    const byId = new Map(assets.map((asset) => [asset.id, asset]));

    for (const sourceAssetId of sourceAssetIds) {
      const asset = byId.get(sourceAssetId);
      if (!asset) {
        throw new NotFoundException(`Asset "${sourceAssetId}" not found`);
      }

      if (!isPrivateVaultAssetUrl(asset.url)) {
        throw new BadRequestException(
          "Source asset is not an Image Vault private upload"
        );
      }

      if (asset.status !== AssetStatus.READY) {
        throw new BadRequestException(
          "Source asset upload is not complete; call POST /assets/:assetId/complete first"
        );
      }

      if (asset.imageVaultEntry) {
        throw new ConflictException(
          "Source asset is already linked to a catalog image entry"
        );
      }

      const linkedEntry = asset.imageVaultSourceLinks[0];
      if (linkedEntry && linkedEntry.imageVaultEntryId !== entryId) {
        throw new ConflictException(
          "Source asset is already linked to another image entry"
        );
      }
    }
  }

  private async assertOptionalRelationsExist(
    modelId?: string | null,
    categoryIds?: string[]
  ): Promise<void> {
    await Promise.all([
      modelId
        ? this.imageVaultModelService.assertExists(modelId)
        : Promise.resolve(),
      categoryIds !== undefined
        ? this.imageVaultCategoryService.assertAllExist(categoryIds)
        : Promise.resolve()
    ]);
  }

  private async mapSourceAsset(
    asset: Asset,
    entryId: string
  ): Promise<ImageVaultSourceAssetDto> {
    const previewUrl = await this.r2.getPrivatePresignedGetUrl({
      key: asset.storageKey,
      meta: {
        image_entry_id: entryId,
        asset_id: asset.id,
        role: "source"
      }
    });

    return {
      id: asset.id,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
      previewUrl
    };
  }

  private async resolveRootSourceAssets(entryId: string): Promise<Asset[]> {
    const visited = new Set<string>();
    let currentId: string | null = entryId;

    while (currentId) {
      if (visited.has(currentId)) {
        return [];
      }
      visited.add(currentId);

      const row: {
        sourceAssets: ImageVaultEntrySourceAssetWithAsset[];
        parentId: string | null;
      } | null = await this.prisma.imageVaultEntry.findUnique({
        where: { id: currentId },
        select: {
          sourceAssets: {
            include: { asset: true },
            orderBy: { sortOrder: "asc" }
          },
          parentId: true
        }
      });

      if (!row) {
        return [];
      }

      if (row.sourceAssets.length > 0) {
        return row.sourceAssets.map((link) => link.asset);
      }

      currentId = row.parentId;
    }

    return [];
  }

  private async mapEntry(
    entry: ImageVaultEntryWithRelations,
    withLineage = false,
    includeSourceAssets = true
  ): Promise<ImageEntryResponseDto> {
    const previewUrl = await this.r2.getPrivatePresignedGetUrl({
      key: entry.asset.storageKey,
      meta: { image_entry_id: entry.id, asset_id: entry.assetId }
    });

    const sourceAssets =
      includeSourceAssets && entry.sourceAssets
        ? await Promise.all(
            entry.sourceAssets.map((link) =>
              this.mapSourceAsset(link.asset, entry.id)
            )
          )
        : [];

    const response: ImageEntryResponseDto = {
      id: entry.id,
      assetId: entry.assetId,
      parentId: entry.parentId,
      originType: entry.originType as ImageOriginTypeDto,
      sourceUrl: entry.sourceUrl,
      prompt: entry.prompt,
      originalPrompt: entry.originalPrompt,
      safetyLevel: entry.safetyLevel as ImageVaultSafetyLevelDto,
      safetyReason: entry.safetyReason,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      previewUrl,
      asset: {
        id: entry.asset.id,
        mimeType: entry.asset.mimeType,
        fileSize: entry.asset.fileSize
      },
      model: entry.model
        ? {
            id: entry.model.id,
            name: entry.model.name,
            provider: entry.model.provider,
            isActive: entry.model.isActive
          }
        : null,
      categories: entry.categories.map((link) => ({
        id: link.imageVaultCategory.id,
        name: link.imageVaultCategory.name,
        slug: link.imageVaultCategory.slug
      })),
      sourceAssets
    };

    if (withLineage) {
      if (sourceAssets.length === 0) {
        const rootSources = await this.resolveRootSourceAssets(entry.id);
        if (rootSources.length > 0) {
          response.rootSourceAssets = await Promise.all(
            rootSources.map((asset) => this.mapSourceAsset(asset, entry.id))
          );
        }
      }

      response.parent = entry.parent
        ? await this.mapLineageSummary(entry.parent)
        : null;
      response.children = entry.children
        ? await Promise.all(
            entry.children.map((child) => this.mapLineageSummary(child))
          )
        : [];
    }

    return response;
  }

  private buildDownloadFilename(id: string, mimeType: string | null): string {
    const extension = mimeType
      ? (IMAGE_VAULT_MIME_TYPE_EXTENSIONS[mimeType] ?? "img")
      : "img";
    return `image-vault-${id}.${extension}`;
  }

  private buildAttachmentDisposition(filename: string): string {
    return `attachment; filename="${filename}"`;
  }

  private async mapLineageSummary(
    image: ImageVaultEntry & { asset: Asset }
  ): Promise<ImageLineageSummaryDto> {
    const previewUrl = await this.r2.getPrivatePresignedGetUrl({
      key: image.asset.storageKey,
      meta: { image_entry_id: image.id }
    });

    return {
      id: image.id,
      prompt: image.prompt,
      originalPrompt: image.originalPrompt,
      previewUrl,
      safetyLevel: image.safetyLevel as ImageVaultSafetyLevelDto,
      createdAt: image.createdAt
    };
  }
}
