import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "@/prisma/prisma.service";

import { MediaType } from "@/upload/enums/media-type.enum";

import { Prisma } from "@prisma/client";

@Injectable()
export class UploadService {
  private readonly uploadsDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    this.uploadsDir =
      this.config.get<string>("UPLOADS_DIR") || join(process.cwd(), "uploads");

    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    type: MediaType,
    reviewId: number
  ): Promise<{ id: string; url: string }> {
    const id = randomUUID();
    const ext = extname(file.originalname);
    const filename = `${id}${ext}`;
    const filePath = join(this.uploadsDir, filename);

    writeFileSync(filePath, file.buffer);

    const port = this.config.get<number>("PORT") || 5000;
    const url = `http://localhost:${port}/uploads/${filename}`;

    const reviewConnect = this.buildReviewConnect(type, reviewId);

    try {
      await this.prisma.reviewImage.create({
        data: { id, url, ...reviewConnect }
      });
    } catch (error) {
      if (existsSync(filePath)) unlinkSync(filePath);

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

    const filename = image.url.split("/").pop();
    if (filename) {
      const filePath = join(this.uploadsDir, filename);
      if (existsSync(filePath)) unlinkSync(filePath);
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
