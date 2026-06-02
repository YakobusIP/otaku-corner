import { CrudContext } from "@/common/crud/types";

export interface CrudHooks<
  TCreateDto = unknown,
  TUpdateDto = unknown,
  TResponse = unknown
> {
  beforeCreate?(ctx: CrudContext<TCreateDto, TResponse>): Promise<void>;
  afterCreate?(ctx: CrudContext<TCreateDto, TResponse>): Promise<void>;
  beforeUpdate?(ctx: CrudContext<TUpdateDto, TResponse>): Promise<void>;
  afterUpdate?(ctx: CrudContext<TUpdateDto, TResponse>): Promise<void>;
  beforeDelete?(ctx: CrudContext<unknown, TResponse>): Promise<void>;
  afterDelete?(ctx: CrudContext<unknown, TResponse>): Promise<void>;
}
