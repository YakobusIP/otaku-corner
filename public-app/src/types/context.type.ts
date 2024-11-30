import { AnimeFilterSort } from "@/types/anime.type";

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

export type { AnimeState, AnimeContextProps };
