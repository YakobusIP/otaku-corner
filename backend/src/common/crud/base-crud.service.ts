import { NotFoundException } from "@nestjs/common";

import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { CrudContext } from "@/common/crud/types/crud-context.type";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import { PaginatedResponseDto, PaginationQueryDto } from "@/common/dto";
import { andWhereClauses } from "@/common/utils";

import { PrismaService } from "@/prisma/prisma.service";

import { Prisma } from "@prisma/client";

export abstract class BaseCrudService<
  TDelegate extends CrudDelegate,
  TCreateDto,
  TUpdateDto,
  TResponse,
  TDetailResponse = TResponse
> {
  protected readonly resourceName: string = "Resource";

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly queryBuilder: CrudQueryBuilder
  ) {}

  protected abstract getDelegate(
    client?: PrismaService | Prisma.TransactionClient
  ): TDelegate;

  // Overridable lifecycle hooks (no-op by default)
  protected async beforeCreate(
    _ctx: CrudContext<TCreateDto, TResponse>
  ): Promise<void> {}
  protected async afterCreate(
    _ctx: CrudContext<TCreateDto, TResponse>
  ): Promise<void> {}
  protected async beforeUpdate(
    _ctx: CrudContext<TUpdateDto, TResponse>
  ): Promise<void> {}
  protected async afterUpdate(
    _ctx: CrudContext<TUpdateDto, TResponse>
  ): Promise<void> {}
  protected async beforeDelete(
    _ctx: CrudContext<unknown, TResponse>
  ): Promise<void> {}
  protected async afterDelete(
    _ctx: CrudContext<unknown, TResponse>
  ): Promise<void> {}

  async create(dto: TCreateDto): Promise<TResponse> {
    return this.prisma.$transaction(async (tx) => {
      const delegate = this.getDelegate(tx);
      const ctx: CrudContext<TCreateDto, TResponse> = { dto, tx };

      await this.beforeCreate(ctx);

      const result = await delegate.create({ data: ctx.dto });
      ctx.result = result as TResponse;

      await this.afterCreate(ctx);

      return ctx.result;
    });
  }

  async findAll(
    query: PaginationQueryDto
  ): Promise<PaginatedResponseDto<TResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const delegate = this.getDelegate();
    const includeIds = query.include_ids ?? [];

    if (includeIds.length === 0) {
      const { where, skip, take, orderBy, include } =
        this.queryBuilder.buildFindAllQuery(query);

      const findManyArgs: Record<string, unknown> = { where, skip, take };
      if (orderBy) findManyArgs.orderBy = orderBy;
      if (include) findManyArgs.include = include;

      const [data, total] = await Promise.all([
        delegate.findMany(findManyArgs) as Promise<TResponse[]>,
        delegate.count({ where }) as Promise<number>
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    }

    const { where, orderBy, include } =
      this.queryBuilder.buildFindAllQuery(query);

    const pinnedFindArgs: Record<string, unknown> = {
      where: { id: { in: includeIds } }
    };
    if (orderBy) {
      pinnedFindArgs.orderBy = orderBy;
    }
    if (include) {
      pinnedFindArgs.include = include;
    }

    const pinnedUnsorted = (await delegate.findMany(
      pinnedFindArgs
    )) as TResponse[];

    const pinnedById = new Map<number, TResponse>(
      pinnedUnsorted.map((row) => {
        const id = (row as { id: number }).id;
        return [id, row];
      })
    );

    const pinned: TResponse[] = [];
    for (const id of includeIds) {
      const row = pinnedById.get(id);
      if (row) {
        pinned.push(row);
      }
    }

    const pinnedIds = pinned.map((row) => (row as { id: number }).id);
    const restWhere =
      pinnedIds.length > 0
        ? andWhereClauses(where, { id: { notIn: pinnedIds } })
        : where;

    if (page === 1) {
      const restTake = Math.max(0, limit - pinned.length);

      const findManyArgs: Record<string, unknown> = {
        where: restWhere,
        skip: 0,
        take: restTake
      };
      if (orderBy) {
        findManyArgs.orderBy = orderBy;
      }
      if (include) {
        findManyArgs.include = include;
      }

      const [rest, total] = await Promise.all([
        restTake > 0
          ? (delegate.findMany(findManyArgs) as Promise<TResponse[]>)
          : Promise.resolve([] as TResponse[]),
        delegate.count({ where }) as Promise<number>
      ]);

      const data = [...pinned, ...rest];

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    }

    const page1End = pinned.length > limit ? pinned.length : limit;
    const sliceStart = page1End + (page - 2) * limit;
    const restSkip = sliceStart - pinned.length;

    const findManyArgs: Record<string, unknown> = {
      where: restWhere,
      skip: restSkip,
      take: limit
    };
    if (orderBy) findManyArgs.orderBy = orderBy;
    if (include) findManyArgs.include = include;

    const [data, total] = await Promise.all([
      delegate.findMany(findManyArgs) as Promise<TResponse[]>,
      delegate.count({ where }) as Promise<number>
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: number): Promise<TDetailResponse> {
    const delegate = this.getDelegate();
    const result = await delegate.findUnique({
      where: { id }
    });

    if (!result) {
      throw new NotFoundException(`${this.resourceName} not found`);
    }

    return result as TDetailResponse;
  }

  async update(id: number, dto: TUpdateDto): Promise<TResponse> {
    return this.prisma.$transaction(async (tx) => {
      const delegate = this.getDelegate(tx);
      const ctx: CrudContext<TUpdateDto, TResponse> = { dto, id, tx };

      await this.beforeUpdate(ctx);

      const result = await delegate.update({
        where: { id },
        data: ctx.dto
      });
      ctx.result = result as TResponse;

      await this.afterUpdate(ctx);

      return ctx.result;
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const delegate = this.getDelegate(tx);
      const ctx: CrudContext<unknown, TResponse> = { id, tx };

      await this.beforeDelete(ctx);
      await delegate.delete({ where: { id } });
      await this.afterDelete(ctx);
    });
  }

  async deleteMany(ids: number[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const delegate = this.getDelegate(tx);
      const ctx: CrudContext<unknown, TResponse> = { ids, tx };

      await this.beforeDelete(ctx);
      await delegate.deleteMany({ where: { id: { in: ids } } });
      await this.afterDelete(ctx);
    });
  }
}
