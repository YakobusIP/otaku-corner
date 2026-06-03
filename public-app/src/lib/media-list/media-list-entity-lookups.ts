import {
  authorService,
  genreService,
  studioService,
  themeService
} from "@/services/entity.service";

import type { EntityLookupConfig } from "@/types/context.type";
import type {
  AuthorEntity,
  GenreEntity,
  StudioEntity,
  ThemeEntity
} from "@/types/entity.type";

export const animeListEntityLookups: EntityLookupConfig[] = [
  {
    resultKey: "genreList",
    queryKey: ["genres"],
    queryFn: () => genreService.fetchAll<GenreEntity>()
  },
  {
    resultKey: "studioList",
    queryKey: ["studios"],
    queryFn: () => studioService.fetchAll<StudioEntity>()
  },
  {
    resultKey: "themeList",
    queryKey: ["themes"],
    queryFn: () => themeService.fetchAll<ThemeEntity>()
  }
];

export const printedMediaListEntityLookups: EntityLookupConfig[] = [
  {
    resultKey: "genreList",
    queryKey: ["genres"],
    queryFn: () => genreService.fetchAll<GenreEntity>()
  },
  {
    resultKey: "authorList",
    queryKey: ["authors"],
    queryFn: () => authorService.fetchAll<AuthorEntity>()
  },
  {
    resultKey: "themeList",
    queryKey: ["themes"],
    queryFn: () => themeService.fetchAll<ThemeEntity>()
  }
];
