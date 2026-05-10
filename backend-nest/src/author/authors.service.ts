import { Injectable } from "@nestjs/common";

import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import { EntityPaginationQueryDto } from "@/common/dto";

import { PrismaService } from "@/prisma/prisma.service";

import {
  AuthorResponseDto,
  CreateAuthorDto,
  PaginatedAuthorsResponseDto,
  UpdateAuthorDto
} from "@/author/dto";

import { Prisma } from "@prisma/client";

@Injectable()
export class AuthorsService extends BaseCrudService<
  CrudDelegate,
  CreateAuthorDto,
  UpdateAuthorDto,
  AuthorResponseDto
> {
  protected readonly resourceName = "Author";

  constructor(prisma: PrismaService, queryBuilder: CrudQueryBuilder) {
    super(prisma, queryBuilder);
  }

  protected getDelegate(
    client?: PrismaService | Prisma.TransactionClient
  ): CrudDelegate {
    return (client ?? this.prisma).author;
  }

  async findAll(
    query: EntityPaginationQueryDto
  ): Promise<PaginatedAuthorsResponseDto> {
    const includeIds = query.include_ids ?? [];
    if (includeIds.length > 0) {
      return super.findAll(query) as Promise<PaginatedAuthorsResponseDto>;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { where } = this.queryBuilder.buildFindAllQuery(query);
    const connected = query.connected_media === true;

    const findArgs: Prisma.AuthorFindManyArgs = {
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "asc" }
    };

    if (connected) {
      findArgs.include = {
        _count: {
          select: { mangas: true, lightNovels: true }
        }
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.author.findMany(findArgs),
      this.prisma.author.count({ where })
    ]);

    const data: AuthorResponseDto[] = rows.map((row) => {
      const base: AuthorResponseDto = {
        id: row.id,
        name: row.name,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };
      if (connected && "_count" in row && row._count) {
        const c = row._count as {
          mangas: number;
          lightNovels: number;
        };
        base.connectedMediaCount = c.mangas + c.lightNovels;
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
    const normalized = names.map((n) => n.trim());
    const existing = await this.prisma.author.findMany({
      where: { name: { in: normalized } }
    });
    const existingSet = new Set(existing.map((a) => a.name));
    const newNames = normalized.filter((n) => !existingSet.has(n));

    if (newNames.length === 0) return existing;

    const created = await this.prisma.author.createManyAndReturn({
      data: newNames.map((name) => ({ name })),
      skipDuplicates: true
    });

    return [...existing, ...created];
  }
}
