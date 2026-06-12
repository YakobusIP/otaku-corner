import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import type { CreateImageCategoryDto } from "@/image-vault/dto/create-image-category.dto";
import type { ImageCategoryResponseDto } from "@/image-vault/dto/image-category-response.dto";
import type { UpdateImageCategoryDto } from "@/image-vault/dto/update-image-category.dto";

import type { ImageVaultCategory } from "@prisma/client";

@Injectable()
export class ImageVaultCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<ImageCategoryResponseDto[]> {
    const rows = await this.prisma.imageVaultCategory.findMany({
      orderBy: { name: "asc" }
    });
    return rows.map((row) => this.mapCategory(row));
  }

  async create(dto: CreateImageCategoryDto): Promise<ImageCategoryResponseDto> {
    const name = dto.name.trim();
    const baseSlug = dto.slug.trim().slice(0, 200);
    const slug = await this.uniqueSlug(baseSlug);

    const row = await this.prisma.imageVaultCategory.create({
      data: { name, slug }
    });
    return this.mapCategory(row);
  }

  async update(
    id: string,
    dto: UpdateImageCategoryDto
  ): Promise<ImageCategoryResponseDto> {
    await this.assertExists(id);

    const slug =
      dto.slug !== undefined
        ? await this.uniqueSlug(dto.slug.trim(), id)
        : undefined;

    const row = await this.prisma.imageVaultCategory.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        slug
      }
    });
    return this.mapCategory(row);
  }

  async deleteMany(ids: string[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) {
      return;
    }

    await this.assertAllExist(uniqueIds);

    await this.prisma.imageVaultCategory.deleteMany({
      where: { id: { in: uniqueIds } }
    });
  }

  async assertExists(id: string): Promise<void> {
    const row = await this.prisma.imageVaultCategory.findUnique({
      where: { id }
    });
    if (!row) {
      throw new NotFoundException(`Image category "${id}" not found`);
    }
  }

  async assertAllExist(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    const rows = await this.prisma.imageVaultCategory.findMany({
      where: { id: { in: ids } },
      select: { id: true }
    });

    if (rows.length !== ids.length) {
      const foundIds = new Set(rows.map((row) => row.id));
      const missingId = ids.find((id) => !foundIds.has(id));
      throw new NotFoundException(`Image category "${missingId}" not found`);
    }
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let candidate = base || "category";
    let suffix = 0;
    for (;;) {
      const existing = await this.prisma.imageVaultCategory.findFirst({
        where: {
          slug: candidate,
          ...(excludeId ? { NOT: { id: excludeId } } : {})
        }
      });
      if (!existing) {
        return candidate;
      }
      suffix += 1;
      candidate = `${base}-${suffix}`.slice(0, 200);
    }
  }

  private mapCategory(row: ImageVaultCategory): ImageCategoryResponseDto {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
}
