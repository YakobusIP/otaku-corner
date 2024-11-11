type GenreEntity = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type StudioEntity = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type ThemeEntity = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type AuthorEntity = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type GenreEntityPartial = Pick<GenreEntity, "id" | "name">;
type StudioEntityPartial = Pick<StudioEntity, "id" | "name">;
type ThemeEntityPartial = Pick<ThemeEntity, "id" | "name">;
type AuthorEntityPartial = Pick<AuthorEntity, "id" | "name">;

export type {
  GenreEntity,
  StudioEntity,
  ThemeEntity,
  AuthorEntity,
  GenreEntityPartial,
  StudioEntityPartial,
  ThemeEntityPartial,
  AuthorEntityPartial
};
