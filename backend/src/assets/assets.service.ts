import { randomUUID } from "node:crypto";

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { storageFailureLogLevel } from "@/common/logging/storage-failure-log-level";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { PrismaService } from "@/prisma/prisma.service";

import {
  ALLOWED_IMAGE_ASSET_MIMES,
  assetDeclaredImageMimeMatchesHead,
  fileExtensionForNormalizedImageMime,
  normalizeDeclaredImageMimeType
} from "@/assets/asset-upload-policy";
import type { CompleteAssetResponseDto } from "@/assets/dto/complete-asset-response.dto";
import type { InitAssetResponseDto } from "@/assets/dto/init-asset-response.dto";
import type { InitAssetDto } from "@/assets/dto/init-asset.dto";
import { AssetInitReviewMediaType } from "@/assets/dto/review-asset-target.dto";
import { ReviewDomainMediaType } from "@/assets/review-domain-media-type.enum";
import {
  R2FileStorageService,
  type R2HeadObjectResult,
  R2_ASSET_CACHE_CONTROL
} from "@/storage/r2-file-storage.service";
import { assertSafeObjectStorageKey } from "@/storage/storage-object-key";

import { AssetMediaType, AssetStatus, ReviewAssetUsage } from "@prisma/client";

const errorFromUnknown = (error: unknown) =>
  error instanceof Error
    ? {
        name: error.name,
        message: error.message,
        stack: error.stack ?? ""
      }
    : {
        name: "Error",
        message: String(error),
        stack: ""
      };

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2FileStorageService,
    private readonly config: ConfigService,
    private readonly logger: StructuredLogger
  ) {}

  async init(dto: InitAssetDto): Promise<InitAssetResponseDto> {
    const assetTargetKind = dto.target.kind;
    const reviewMediaType =
      dto.target.kind === "REVIEW" ? dto.target.mediaType : undefined;

    this.logger.logStorage({
      level: "info",
      event: "asset.init.started",
      message: "Asset init started",
      meta: {
        asset_target_kind: assetTargetKind,
        review_media_type: reviewMediaType,
        mime_type: dto.mimeType,
        expected_file_size: dto.expectedFileSize
      }
    });

    try {
      const assetMediaType = dto.assetMediaType ?? AssetMediaType.IMAGE;
      if (assetMediaType !== AssetMediaType.IMAGE) {
        throw new BadRequestException("Only image assets are supported");
      }

      const mimeNorm = normalizeDeclaredImageMimeType(dto.mimeType);
      if (!mimeNorm || !ALLOWED_IMAGE_ASSET_MIMES.has(mimeNorm)) {
        throw new BadRequestException("Unsupported MIME type");
      }

      const maxBytes = this.config.getOrThrow<number>("MAX_FILE_SIZE");
      if (dto.expectedFileSize > maxBytes) {
        throw new BadRequestException("File exceeds maximum allowed size");
      }

      if (dto.target.kind !== "REVIEW") {
        throw new BadRequestException("Unsupported asset target kind");
      }

      const domainMediaType = this.reviewInitMediaToDomainType(
        dto.target.mediaType
      );

      await this.assertReviewExists(domainMediaType, dto.target.id);

      const ext = fileExtensionForNormalizedImageMime(mimeNorm);
      if (!ext) {
        throw new BadRequestException("Unsupported MIME type");
      }

      const id = randomUUID();
      const prefix = dto.storageDirectory
        .trim()
        .replace(/^\/+/, "")
        .replace(/\/+$/, "");
      if (!prefix) {
        throw new BadRequestException("storageDirectory cannot be empty");
      }
      const storageKey = `${prefix}/${id}${ext}`;
      assertSafeObjectStorageKey(storageKey);
      const url = this.r2.publicUrlForFile(storageKey);

      const reviewLink = this.buildReviewAssetLink(
        domainMediaType,
        dto.target.id
      );

      await this.prisma.asset.create({
        data: {
          id,
          storageKey,
          url,
          mimeType: mimeNorm,
          mediaType: AssetMediaType.IMAGE,
          expectedFileSize: dto.expectedFileSize,
          status: AssetStatus.PENDING,
          reviewAssets: {
            create: {
              usage: ReviewAssetUsage.IMAGE,
              ...reviewLink
            }
          }
        }
      });

      const uploadUrl = await this.r2.getPresignedPutUrl({
        key: storageKey,
        contentType: mimeNorm,
        meta: {
          asset_id: id,
          asset_target_kind: assetTargetKind,
          review_media_type: reviewMediaType
        }
      });

      this.logger.logStorage({
        level: "info",
        event: "asset.init.completed",
        message: "Asset init completed",
        meta: {
          asset_id: id,
          asset_target_kind: assetTargetKind,
          review_media_type: reviewMediaType,
          mime_type: mimeNorm,
          expected_file_size: dto.expectedFileSize,
          storage_key: storageKey
        }
      });

      return {
        assetId: id,
        uploadUrl,
        method: "PUT",
        headers: {
          "Content-Type": mimeNorm,
          "Cache-Control": R2_ASSET_CACHE_CONTROL
        }
      };
    } catch (error: unknown) {
      this.logger.logStorage({
        level: storageFailureLogLevel(error),
        event: "asset.init.failed",
        message: "Asset init failed",
        error: errorFromUnknown(error),
        meta: {
          asset_target_kind: assetTargetKind,
          review_media_type: reviewMediaType,
          mime_type: dto.mimeType,
          expected_file_size: dto.expectedFileSize
        }
      });
      throw error;
    }
  }

  async complete(assetId: string): Promise<CompleteAssetResponseDto> {
    this.logger.logStorage({
      level: "info",
      event: "asset.complete.started",
      message: "Asset complete started",
      meta: { asset_id: assetId }
    });

    try {
      const asset = await this.prisma.asset.findUnique({
        where: { id: assetId }
      });

      if (!asset) {
        throw new NotFoundException(`Asset "${assetId}" not found`);
      }

      if (asset.status === AssetStatus.READY) {
        this.logger.logStorage({
          level: "info",
          event: "asset.complete.completed",
          message: "Asset already ready",
          meta: {
            asset_id: assetId,
            mime_type: asset.mimeType,
            expected_file_size: asset.expectedFileSize,
            observed_file_size: asset.fileSize
          }
        });
        return {
          assetId: asset.id,
          status: AssetStatus.READY,
          url: asset.url
        };
      }

      if (asset.status === AssetStatus.FAILED) {
        throw new BadRequestException(
          "Asset upload failed; create a new asset to retry"
        );
      }

      let head: R2HeadObjectResult | null;
      try {
        head = await this.r2.headObject(asset.storageKey, {
          asset_id: assetId,
          mime_type: asset.mimeType
        });
      } catch {
        throw new ServiceUnavailableException(
          "Storage temporarily unavailable; retry complete shortly"
        );
      }

      if (head === null) {
        throw new ConflictException(
          "Upload not visible yet; retry after the PUT finishes"
        );
      }

      if (head.contentLength !== asset.expectedFileSize) {
        await this.prisma.asset.update({
          where: { id: assetId },
          data: { status: AssetStatus.FAILED }
        });
        throw new BadRequestException(
          "Uploaded size does not match declared size"
        );
      }

      if (
        !assetDeclaredImageMimeMatchesHead(head.contentType, asset.mimeType)
      ) {
        await this.prisma.asset.update({
          where: { id: assetId },
          data: { status: AssetStatus.FAILED }
        });
        throw new BadRequestException(
          "Stored content type does not match declared MIME type"
        );
      }

      const updated = await this.prisma.asset.update({
        where: { id: assetId },
        data: {
          status: AssetStatus.READY,
          fileSize: head.contentLength
        }
      });

      this.logger.logStorage({
        level: "info",
        event: "asset.complete.completed",
        message: "Asset complete completed",
        meta: {
          asset_id: assetId,
          mime_type: asset.mimeType,
          expected_file_size: asset.expectedFileSize,
          observed_file_size: head.contentLength
        }
      });

      return {
        assetId: updated.id,
        status: updated.status,
        url: updated.url
      };
    } catch (error: unknown) {
      this.logger.logStorage({
        level: storageFailureLogLevel(error),
        event: "asset.complete.failed",
        message: "Asset complete failed",
        error: errorFromUnknown(error),
        meta: { asset_id: assetId }
      });
      throw error;
    }
  }

  async delete(assetId: string): Promise<void> {
    this.logger.logStorage({
      level: "info",
      event: "asset.delete.started",
      message: "Asset delete started",
      meta: { asset_id: assetId }
    });

    try {
      const asset = await this.prisma.asset.findUnique({
        where: { id: assetId }
      });

      if (!asset) {
        throw new NotFoundException(`Asset "${assetId}" not found`);
      }

      try {
        await this.r2.deleteObject(asset.storageKey, {
          asset_id: assetId,
          mime_type: asset.mimeType
        });
      } catch {
        throw new ServiceUnavailableException(
          "Could not delete object from storage; retry later"
        );
      }

      await this.prisma.asset.delete({ where: { id: assetId } });

      this.logger.logStorage({
        level: "info",
        event: "asset.delete.completed",
        message: "Asset delete completed",
        meta: {
          asset_id: assetId,
          mime_type: asset.mimeType,
          storage_key: asset.storageKey
        }
      });
    } catch (error: unknown) {
      this.logger.logStorage({
        level: storageFailureLogLevel(error),
        event: "asset.delete.failed",
        message: "Asset delete failed",
        error: errorFromUnknown(error),
        meta: { asset_id: assetId }
      });
      throw error;
    }
  }

  private reviewInitMediaToDomainType(
    media: AssetInitReviewMediaType
  ): ReviewDomainMediaType {
    switch (media) {
      case AssetInitReviewMediaType.ANIME:
        return ReviewDomainMediaType.ANIME;
      case AssetInitReviewMediaType.MANGA:
        return ReviewDomainMediaType.MANGA;
      case AssetInitReviewMediaType.LIGHT_NOVEL:
        return ReviewDomainMediaType.LIGHT_NOVEL;
      default:
        throw new BadRequestException("Unsupported review media type");
    }
  }

  private async assertReviewExists(
    type: ReviewDomainMediaType,
    reviewId: number
  ): Promise<void> {
    switch (type) {
      case ReviewDomainMediaType.ANIME: {
        const row = await this.prisma.animeReview.findUnique({
          where: { id: reviewId }
        });
        if (!row) throw new NotFoundException("Anime review not found");
        return;
      }
      case ReviewDomainMediaType.MANGA: {
        const row = await this.prisma.mangaReview.findUnique({
          where: { id: reviewId }
        });
        if (!row) throw new NotFoundException("Manga review not found");
        return;
      }
      case ReviewDomainMediaType.LIGHT_NOVEL: {
        const row = await this.prisma.lightNovelReview.findUnique({
          where: { id: reviewId }
        });
        if (!row) throw new NotFoundException("Light novel review not found");
        return;
      }
      default:
        throw new BadRequestException(`Invalid media type: ${type as string}`);
    }
  }

  private buildReviewAssetLink(type: ReviewDomainMediaType, reviewId: number) {
    switch (type) {
      case ReviewDomainMediaType.ANIME:
        return { animeReviewId: reviewId };
      case ReviewDomainMediaType.MANGA:
        return { mangaReviewId: reviewId };
      case ReviewDomainMediaType.LIGHT_NOVEL:
        return { lightNovelReviewId: reviewId };
      default:
        throw new BadRequestException(`Invalid media type: ${type as string}`);
    }
  }
}
