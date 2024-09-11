type GenreEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type GenreEntityPartial = Pick<GenreEntity, "id" | "name">;

type StudioEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type StudioEntityPartial = Pick<StudioEntity, "id" | "name">;

type ThemeEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type ThemeEntityPartial = Pick<ThemeEntity, "id" | "name">;

type AuthorEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type AuthorEntityPartial = Pick<AuthorEntity, "id" | "name">;

export type {
  GenreEntity,
  GenreEntityPartial,
  StudioEntity,
  StudioEntityPartial,
  ThemeEntity,
  ThemeEntityPartial,
  AuthorEntity,
  AuthorEntityPartial
};
