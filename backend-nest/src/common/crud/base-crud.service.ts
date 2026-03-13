import { ConflictException, NotFoundException } from "@nestjs/common";

import { CrudQueryBuilder } from "@/common/crud/crud-query-builder.interface";
import { CrudContext } from "@/common/crud/types/crud-context.type";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";
import { PaginatedResponseDto, PaginationQueryDto } from "@/common/dto";

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
    return this.handlePrismaError(() =>
      this.prisma.$transaction(async (tx) => {
        const delegate = this.getDelegate(tx);
        const ctx: CrudContext<TCreateDto, TResponse> = { dto, tx };

        await this.beforeCreate(ctx);

        const result = await delegate.create({ data: ctx.dto });
        ctx.result = result as TResponse;

        await this.afterCreate(ctx);

        return ctx.result;
      })
    );
  }

  async findAll(
    query: PaginationQueryDto
  ): Promise<PaginatedResponseDto<TResponse>> {
    const { where, skip, take, orderBy, include } =
      this.queryBuilder.buildFindAllQuery(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const delegate = this.getDelegate();

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
    return this.handlePrismaError(() =>
      this.prisma.$transaction(async (tx) => {
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
      })
    );
  }

  async delete(id: number): Promise<void> {
    await this.handlePrismaError(() =>
      this.prisma.$transaction(async (tx) => {
        const delegate = this.getDelegate(tx);
        const ctx: CrudContext<unknown, TResponse> = { id, tx };

        await this.beforeDelete(ctx);
        await delegate.delete({ where: { id } });
        await this.afterDelete(ctx);
      })
    );
  }

  async deleteMany(ids: number[]): Promise<void> {
    await this.handlePrismaError(() =>
      this.prisma.$transaction(async (tx) => {
        const delegate = this.getDelegate(tx);
        const ctx: CrudContext<unknown, TResponse> = { ids, tx };

        await this.beforeDelete(ctx);
        await delegate.deleteMany({ where: { id: { in: ids } } });
        await this.afterDelete(ctx);
      })
    );
  }

  private async handlePrismaError<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(`${this.resourceName} already exists`);
        }
        if (error.code === "P2025") {
          throw new NotFoundException(`${this.resourceName} not found`);
        }
      }
      throw error;
    }
  }
}
