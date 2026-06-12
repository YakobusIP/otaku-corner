import { Injectable } from "@nestjs/common";

import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import { EntityPaginationQueryDto } from "@/common/dto";
import { getOrCreateManyNameRows } from "@/common/utils/relation-get-or-create-many";

import { PrismaService } from "@/prisma/prisma.service";

import {
  CreateGenreDto,
  GenreResponseDto,
  PaginatedGenresResponseDto,
  UpdateGenreDto
} from "@/genre/dto";

import { Prisma } from "@prisma/client";

@Injectable()
export class GenresService extends BaseCrudService<
  CrudDelegate,
  CreateGenreDto,
  UpdateGenreDto,
  GenreResponseDto
> {
  protected readonly resourceName = "Genre";

  constructor(prisma: PrismaService, queryBuilder: CrudQueryBuilder) {
    super(prisma, queryBuilder);
  }

  protected getDelegate(
    client?: PrismaService | Prisma.TransactionClient
  ): CrudDelegate {
    return (client ?? this.prisma).genre;
  }

  async findAll(
    query: EntityPaginationQueryDto
  ): Promise<PaginatedGenresResponseDto> {
    const includeIds = query.include_ids ?? [];
    if (includeIds.length > 0) {
      return super.findAll(query) as Promise<PaginatedGenresResponseDto>;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { where } = this.queryBuilder.buildFindAllQuery(query);
    const connected = query.connected_media === true;

    const findArgs: Prisma.GenreFindManyArgs = {
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "asc" }
    };

    if (connected) {
      findArgs.include = {
        _count: {
          select: { animes: true, mangas: true, lightNovels: true }
        }
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.genre.findMany(findArgs),
      this.prisma.genre.count({ where })
    ]);

    const data: GenreResponseDto[] = rows.map((row) => {
      const base: GenreResponseDto = {
        id: row.id,
        name: row.name,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };
      if (connected && "_count" in row && row._count) {
        const c = row._count as {
          animes: number;
          mangas: number;
          lightNovels: number;
        };
        base.connectedMediaCount = c.animes + c.mangas + c.lightNovels;
      }
      return base;
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0
    };
  }

  async getOrCreateMany(names: string[]) {
    return getOrCreateManyNameRows(this.prisma.genre, names);
  }
}
