import { randomUUID } from "node:crypto";

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "@/prisma/prisma.service";

import { FileStorageService } from "@/storage/file-storage.service";
import { MediaType } from "@/upload/enums/media-type.enum";
import {
  assertDeclaredMimeMatchesImageBuffer,
  detectImageFormatFromBuffer,
  fileExtensionForDetectedImageFormat
} from "@/upload/image-buffer-validation";

import { Prisma } from "@prisma/client";

@Injectable()
export class UploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
    private readonly config: ConfigService
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
    const filename = `${id}${ext}`;

    await this.fileStorage.writeFileAsync(filename, file.buffer);
    const url = this.fileStorage.publicUrlForFile(filename);

    const reviewConnect = this.buildReviewConnect(type, reviewId);

    try {
      await this.prisma.reviewImage.create({
        data: { id, url, ...reviewConnect }
      });
    } catch (error) {
      this.fileStorage.deleteFileIfExists(filename);

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Image with this URL already exists");
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

    const raw = image.url.split("/").pop()?.split("?")[0];
    const filename = raw ? decodeURIComponent(raw) : "";
    if (filename) {
      try {
        this.fileStorage.deleteFileIfExists(filename);
      } catch {
        // Ignore invalid or legacy keys; DB row is still removed.
      }
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
