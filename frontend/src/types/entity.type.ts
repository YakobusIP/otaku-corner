type GenreEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type GenreEntityPartial = Pick<GenreEntity, "id" & "name">;

type StudioEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type StudioEntityPartial = Pick<GenreEntity, "id" & "name">;

type ThemeEntity = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type ThemeEntityPartial = Pick<GenreEntity, "id" & "name">;

export type {
  GenreEntity,
  GenreEntityPartial,
  StudioEntity,
  StudioEntityPartial,
  ThemeEntity,
  ThemeEntityPartial
};
