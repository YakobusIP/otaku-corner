export type CrudDelegate = {
  findMany(args?: unknown): PromiseLike<unknown>;
  findUnique(args?: unknown): PromiseLike<unknown>;
  create(args?: unknown): PromiseLike<unknown>;
  update(args?: unknown): PromiseLike<unknown>;
  delete(args?: unknown): PromiseLike<unknown>;
  deleteMany(args?: unknown): PromiseLike<unknown>;
  count(args?: unknown): PromiseLike<number>;
};
