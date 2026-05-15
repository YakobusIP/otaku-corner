import { randomUUID } from "node:crypto";

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { WinstonLoggerService } from "@/common/logging/winston-logger.service";

import { PrismaService } from "@/prisma/prisma.service";

import {
  FILE_STORAGE,
  type FileStorage
} from "@/storage/file-storage.interface";
import { MediaType } from "@/upload/enums/media-type.enum";
import {
  assertDeclaredMimeMatchesImageBuffer,
  detectImageFormatFromBuffer,
  fileExtensionForDetectedImageFormat,
  mimeTypeForDetectedImageFormat
} from "@/upload/image-buffer-validation";

import { Prisma } from "@prisma/client";

const REVIEW_IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";

@Injectable()
export class UploadService {
  constructor(
    @Inject(FILE_STORAGE) private readonly fileStorage: FileStorage,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: WinstonLoggerService
  ) {}

  async uploadImage(
    file: Express.Multer.File | undefined,
    type: MediaType,
    reviewId: number
  ): Promise<{ id: string; url: string }> {
    if (!file?.buffer) {
      throw new BadRequestException("An image file is required");
    }

    const maxBytes = this.config.getOrThrow<number>("MAX_FILE_SIZE");
    if (file.buffer.length > maxBytes) {
      throw new BadRequestException("Image exceeds maximum allowed size");
    }

    const format = detectImageFormatFromBuffer(file.buffer);
    if (!format) {
      throw new BadRequestException(
        "Unsupported image format (allowed: JPEG, PNG, GIF, WebP)"
      );
    }
    assertDeclaredMimeMatchesImageBuffer(file.mimetype, format);

    const id = randomUUID();
    const ext = fileExtensionForDetectedImageFormat(format);
    // TODO: Future file uploads should go to a general table
    const storageKey = `review-images/${id}${ext}`;

    await this.fileStorage.writeFileAsync(storageKey, file.buffer, {
      contentType: mimeTypeForDetectedImageFormat(format),
      cacheControl: REVIEW_IMAGE_CACHE_CONTROL
    });
    const url = this.fileStorage.publicUrlForFile(storageKey);

    const reviewConnect = this.buildReviewConnect(type, reviewId);

    try {
      await this.prisma.reviewImage.create({
        data: { id, url, storageKey, ...reviewConnect }
      });
    } catch (error) {
      await this.fileStorage.deleteFileIfExists(storageKey);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Image already exists");
      }
      throw error;
    }

    return { id, url };
  }

  async deleteImage(id: string): Promise<void> {
    const image = await this.prisma.reviewImage.findUnique({ where: { id } });

    if (!image) {
      throw new NotFoundException(`Image with id "${id}" not found`);
    }

    if (!image.storageKey || image.storageKey.trim() === "") {
      this.logger.error(
        `ReviewImage ${id} is missing storageKey`,
        undefined,
        UploadService.name
      );
      throw new InternalServerErrorException("Image record is incomplete");
    }

    try {
      await this.fileStorage.deleteFileIfExists(image.storageKey);
    } catch (error) {
      this.logger.error(
        `Failed to delete stored object for ReviewImage ${id}`,
        error instanceof Error ? error.stack : undefined,
        UploadService.name
      );
      throw new InternalServerErrorException(
        "Failed to delete stored image. Try again later."
      );
    }

    await this.prisma.reviewImage.delete({ where: { id } });
  }

  private buildReviewConnect(type: MediaType, reviewId: number) {
    switch (type) {
      case MediaType.ANIME:
        return { animeReview: { connect: { id: reviewId } } };
      case MediaType.MANGA:
        return { mangaReview: { connect: { id: reviewId } } };
      case MediaType.LIGHT_NOVEL:
        return { lightNovelReview: { connect: { id: reviewId } } };
      default:
        throw new BadRequestException(`Invalid media type: ${type as string}`);
    }
  }
}
