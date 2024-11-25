type GenreEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type StudioEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type ThemeEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type AuthorEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type GenreWithMediaCount = GenreEntity & {
  connectedMediaCount: number;
};

type StudioWithMediaCount = StudioEntity & {
  connectedMediaCount: number;
};

type ThemeWithMediaCount = ThemeEntity & {
  connectedMediaCount: number;
};

type AuthorWithMediaCount = AuthorEntity & {
  connectedMediaCount: number;
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
  GenreWithMediaCount,
  StudioWithMediaCount,
  ThemeWithMediaCount,
  AuthorWithMediaCount,
  GenreEntityPartial,
  StudioEntityPartial,
  ThemeEntityPartial,
  AuthorEntityPartial
};
