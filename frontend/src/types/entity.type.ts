type GenreEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type GenreWithMediaCount = GenreEntity & {
  connectedMediaCount: number;
};

type GenreEntityPartial = Pick<GenreEntity, "id" | "name">;

type StudioEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type StudioWithMediaCount = StudioEntity & {
  connectedMediaCount: number;
};

type StudioEntityPartial = Pick<StudioEntity, "id" | "name">;

type ThemeEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type ThemeWithMediaCount = ThemeEntity & {
  connectedMediaCount: number;
};

type ThemeEntityPartial = Pick<ThemeEntity, "id" | "name">;

type AuthorEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type AuthorWithMediaCount = AuthorEntity & {
  connectedMediaCount: number;
};

type AuthorEntityPartial = Pick<AuthorEntity, "id" | "name">;

export type {
  GenreEntity,
  GenreWithMediaCount,
  GenreEntityPartial,
  StudioEntity,
  StudioWithMediaCount,
  StudioEntityPartial,
  ThemeEntity,
  ThemeWithMediaCount,
  ThemeEntityPartial,
  AuthorEntity,
  AuthorWithMediaCount,
  AuthorEntityPartial
};
