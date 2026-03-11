import { PaginationQueryDto, PaginatedResponseDto } from "@/common/dto";
import { BaseCrudService } from "@/common/crud/base-crud.service";
import { CrudDelegate } from "@/common/crud/types/crud-delegate.type";

export abstract class BaseCrudController<
  TCreateDto,
  TUpdateDto,
  TResponse,
  TPaginatedResponse extends PaginatedResponseDto<TResponse>,
  TService extends BaseCrudService<
    CrudDelegate,
    TCreateDto,
    TUpdateDto,
    TResponse,
    unknown
  >,
> {
  constructor(protected readonly service: TService) {}

  protected async baseCreate(dto: TCreateDto): Promise<TResponse> {
    return this.service.create(dto);
  }

  protected async baseFindAll(
    query: PaginationQueryDto,
  ): Promise<TPaginatedResponse> {
    return this.service.findAll(query) as Promise<TPaginatedResponse>;
  }

  protected async baseFindOne(
    id: number,
  ): Promise<Awaited<ReturnType<TService["findOne"]>>> {
    return this.service.findOne(id) as Promise<
      Awaited<ReturnType<TService["findOne"]>>
    >;
  }

  protected async baseUpdate(id: number, dto: TUpdateDto): Promise<TResponse> {
    return this.service.update(id, dto);
  }

  protected async baseDelete(id: number): Promise<void> {
    return this.service.delete(id);
  }

  protected async baseDeleteMany(ids: number[]): Promise<void> {
    return this.service.deleteMany(ids);
  }
}
