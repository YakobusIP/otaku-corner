import { AnimeFilterSort } from "@/types/anime.type";
import { LightNovelFilterSort } from "@/types/lightnovel.type";
import { MangaFilterSort } from "@/types/manga.type";

type AnimeState = {
  page: number;
  query: string;
  filters: AnimeFilterSort;
};

type AnimeContextProps = {
  state: AnimeState;
  setQuery: (query: string) => void;
  setState: (newState: Partial<Omit<AnimeState, "query">>) => void;
};

type MangaState = {
  page: number;
  query: string;
  filters: MangaFilterSort;
};

type MangaContextProps = {
  state: MangaState;
  setQuery: (query: string) => void;
  setState: (newState: Partial<Omit<MangaState, "query">>) => void;
};

type LightNovelState = {
  page: number;
  query: string;
  filters: LightNovelFilterSort;
};

type LightNovelContextProps = {
  state: LightNovelState;
  setQuery: (query: string) => void;
  setState: (newState: Partial<Omit<LightNovelState, "query">>) => void;
};

export type {
  AnimeState,
  AnimeContextProps,
  MangaState,
  MangaContextProps,
  LightNovelState,
  LightNovelContextProps
};
