export interface CrudContext<TDto = unknown, TResult = unknown> {
  dto?: TDto;
  result?: TResult;
  id?: number;
  ids?: number[];
  tx?: unknown;
  meta?: Record<string, unknown>;
}
