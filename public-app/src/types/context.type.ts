import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { z } from "zod";

const statusKeys = Object.keys(PROGRESS_STATUS).filter((key) =>
  isNaN(Number(key))
);

const sortOrders = Object.keys(SORT_ORDER).filter((key) => isNaN(Number(key)));

const _AnimeStateSchema = z.object({
  page: z.number(),
  query: z.string().optional(),
  status: z.enum(statusKeys as [string, ...string[]]).optional(),
  filters: z.object({
    genre: z.number().optional(),
    studio: z.number().optional(),
    theme: z.number().optional(),
    malScore: z.string().optional(),
    personalScore: z.string().optional(),
    type: z.string().optional()
  }),
  sort: z.string().optional(),
  order: z.enum(sortOrders as [string, ...string[]]).optional()
});

type AnimeState = z.infer<typeof _AnimeStateSchema>;

type AnimeContextProps = {
  state: AnimeState;
  setQuery: (query: string) => void;
  setState: (newState: Partial<Omit<AnimeState, "query">>) => void;
};

const _MangaStateSchema = z.object({
  page: z.number(),
  query: z.string().optional(),
  status: z.enum(statusKeys as [string, ...string[]]).optional(),
  filters: z.object({
    author: z.number().optional(),
    genre: z.number().optional(),
    theme: z.number().optional(),
    malScore: z.string().optional(),
    personalScore: z.string().optional()
  }),
  sort: z.string().optional(),
  order: z.enum(sortOrders as [string, ...string[]]).optional()
});

type MangaState = z.infer<typeof _MangaStateSchema>;

type MangaContextProps = {
  state: MangaState;
  setQuery: (query: string) => void;
  setState: (newState: Partial<Omit<MangaState, "query">>) => void;
};

const _LightNovelStateSchema = z.object({
  page: z.number(),
  query: z.string().optional(),
  status: z.enum(statusKeys as [string, ...string[]]).optional(),
  filters: z.object({
    author: z.number().optional(),
    genre: z.number().optional(),
    theme: z.number().optional(),
    malScore: z.string().optional(),
    personalScore: z.string().optional()
  }),
  sort: z.string().optional(),
  order: z.enum(sortOrders as [string, ...string[]]).optional()
});

type LightNovelState = z.infer<typeof _LightNovelStateSchema>;

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
