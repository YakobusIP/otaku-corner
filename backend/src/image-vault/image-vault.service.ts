import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { AssetsService } from "@/assets/assets.service";
import type { CreateImageEntryDto } from "@/image-vault/dto/create-image-entry.dto";
import {
  IMAGE_VAULT_DEFAULT_PAGE_LIMIT,
  type ImageEntryListQueryDto
} from "@/image-vault/dto/image-entry-list-query.dto";
import type {
  ImageEntryResponseDto,
  ImageLineageSummaryDto,
  PaginatedImageEntriesResponseDto
} from "@/image-vault/dto/image-entry-response.dto";
import {
  ImageOriginTypeDto,
  ImageVaultSafetyLevelDto
} from "@/image-vault/dto/image-vault-enums";
import type { UpdateImageEntryDto } from "@/image-vault/dto/update-image-entry.dto";
import { ImageVaultCategoryService } from "@/image-vault/image-vault-category.service";
import { ImageVaultModelService } from "@/image-vault/image-vault-model.service";
import { IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY } from "@/image-vault/image-vault.constants";
import { isPrivateVaultAssetUrl } from "@/storage/asset-storage-scope";
import { R2FileStorageService } from "@/storage/r2-file-storage.service";

import {
  type Asset,
  AssetStatus,
  type ImageVaultEntry,
  type ImageVaultEntryCategory,
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

type ImageVaultEntryWithRelations = ImageVaultEntry & {
  asset: Asset;
  sourceAsset?: Asset | null;
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

    if (dto.parentId && dto.sourceAssetId) {
      throw new BadRequestException(
        "Follow-up images cannot include a source image"
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

    if (dto.sourceAssetId) {
      await this.assertSourceAssetReady(dto.sourceAssetId, dto.assetId);
    }

    const categoryIds = this.normalizeCategoryIds(dto.categoryIds);
    await this.assertOptionalRelationsExist(dto.modelId, categoryIds);

    const entry = await this.prisma.imageVaultEntry.create({
      data: {
        assetId: dto.assetId,
        parentId: dto.parentId ?? null,
        sourceAssetId: dto.sourceAssetId ?? null,
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
          : {})
      },
      include: this.entryInclude()
    });

    return this.mapEntry(entry);
  }

  async findAllImages(
    query: ImageEntryListQueryDto
  ): Promise<PaginatedImageEntriesResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? IMAGE_VAULT_DEFAULT_PAGE_LIMIT;
    const where = this.buildListWhere(query);

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
        sourceAssetId: true,
        parentId: true,
        originType: true,
        modelId: true,
        prompt: true,
        sourceUrl: true,
        safetyLevel: true,
        safetyReason: true,
        originalPrompt: true
      }
    });

    if (!existing) {
      throw new NotFoundException(`Image entry "${id}" not found`);
    }

    if (dto.sourceAssetId !== undefined) {
      if (existing.parentId) {
        throw new BadRequestException(
          "Source image can only be attached to root image vault entries"
        );
      }
      if (dto.sourceAssetId) {
        await this.assertSourceAssetReady(
          dto.sourceAssetId,
          existing.assetId,
          id
        );
      }
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

    const previousSourceAssetId = existing.sourceAssetId;

    const updated = await this.prisma.imageVaultEntry.update({
      where: { id },
      data: {
        originType: dto.originType as ImageVaultOriginType | undefined,
        sourceAssetId: dto.sourceAssetId,
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
          : {})
      },
      include: this.entryInclude()
    });

    if (
      dto.sourceAssetId !== undefined &&
      previousSourceAssetId &&
      previousSourceAssetId !== dto.sourceAssetId
    ) {
      await this.assetsService.delete(previousSourceAssetId);
    }

    return this.mapEntry(updated);
  }

  async deleteImage(id: string): Promise<void> {
    const entry = await this.prisma.imageVaultEntry.findUnique({
      where: { id },
      select: {
        assetId: true,
        sourceAssetId: true,
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

    const sourceAssetId = entry.sourceAssetId;

    await this.assetsService.delete(entry.assetId, {
      allowImageVaultLinkedAsset: true
    });

    if (sourceAssetId) {
      await this.assetsService.delete(sourceAssetId);
    }
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

  async getSourceImageDownloadUrl(id: string): Promise<string> {
    const entry = await this.prisma.imageVaultEntry.findUnique({
      where: { id },
      include: { sourceAsset: true }
    });

    if (!entry) {
      throw new NotFoundException(`Image entry "${id}" not found`);
    }

    const sourceAsset =
      entry.sourceAsset ?? (await this.resolveRootSourceAsset(id));

    if (!sourceAsset) {
      throw new NotFoundException(`Source image not found for entry "${id}"`);
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
      sourceAsset: true,
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

  private buildListWhere(
    query: ImageEntryListQueryDto
  ): Prisma.ImageVaultEntryWhereInput {
    const where: Prisma.ImageVaultEntryWhereInput = {};

    if (query.originType) {
      where.originType = query.originType as ImageVaultOriginType;
    }
    if (query.modelId) {
      where.modelId = query.modelId;
    }
    if (query.categoryId) {
      where.categories = {
        some: {
          imageVaultCategoryId: query.categoryId
        }
      };
    }
    if (query.safetyLevel) {
      where.safetyLevel = query.safetyLevel as ImageVaultSafetyLevel;
    }
    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { prompt: { contains: term, mode: "insensitive" } },
        { originalPrompt: { contains: term, mode: "insensitive" } },
        { sourceUrl: { contains: term, mode: "insensitive" } },
        { notes: { contains: term, mode: "insensitive" } }
      ];
    }

    return where;
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

  private normalizeCategoryIds(categoryIds?: string[]): string[] {
    if (!categoryIds?.length) {
      return [];
    }

    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const id of categoryIds) {
      if (!seen.has(id)) {
        seen.add(id);
        normalized.push(id);
      }
    }

    if (normalized.length > IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY) {
      throw new BadRequestException(
        `At most ${IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY} categories per image`
      );
    }

    return normalized;
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

  private async assertSourceAssetReady(
    sourceAssetId: string,
    catalogAssetId: string,
    entryId?: string
  ): Promise<void> {
    if (sourceAssetId === catalogAssetId) {
      throw new BadRequestException(
        "Source image must differ from the catalog image"
      );
    }

    const asset = await this.prisma.asset.findUnique({
      where: { id: sourceAssetId },
      include: {
        imageVaultEntry: { select: { id: true } },
        imageVaultSourceEntries: { select: { id: true } }
      }
    });

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

    const linkedEntry = asset.imageVaultSourceEntries;
    if (linkedEntry && linkedEntry.id !== entryId) {
      throw new ConflictException(
        "Source asset is already linked to another image entry"
      );
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

  private async mapSourceAsset(asset: Asset, entryId: string) {
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

  private async resolveRootSourceAsset(entryId: string): Promise<Asset | null> {
    const visited = new Set<string>();
    let currentId: string | null = entryId;

    while (currentId) {
      if (visited.has(currentId)) {
        return null;
      }
      visited.add(currentId);

      const row: {
        sourceAsset: Asset | null;
        parentId: string | null;
      } | null = await this.prisma.imageVaultEntry.findUnique({
        where: { id: currentId },
        select: {
          sourceAsset: true,
          parentId: true
        }
      });

      if (!row) {
        return null;
      }

      if (row.sourceAsset) {
        return row.sourceAsset;
      }

      currentId = row.parentId;
    }

    return null;
  }

  private async mapEntry(
    entry: ImageVaultEntryWithRelations,
    withLineage = false,
    includeSourceAsset = true
  ): Promise<ImageEntryResponseDto> {
    const previewUrl = await this.r2.getPrivatePresignedGetUrl({
      key: entry.asset.storageKey,
      meta: { image_entry_id: entry.id, asset_id: entry.assetId }
    });

    const sourceAsset =
      includeSourceAsset && entry.sourceAsset
        ? await this.mapSourceAsset(entry.sourceAsset, entry.id)
        : null;

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
      sourceAsset
    };

    if (withLineage) {
      if (!sourceAsset) {
        const rootSource = await this.resolveRootSourceAsset(entry.id);
        if (rootSource) {
          response.rootSourceAsset = await this.mapSourceAsset(
            rootSource,
            entry.id
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
