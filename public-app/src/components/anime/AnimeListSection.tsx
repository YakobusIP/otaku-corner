"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";

import AnimeCard from "@/app/anime/AnimeCard";

import { fetchAllAnimeService } from "@/services/anime.service";

import AnimePagination from "@/components/anime/AnimePagination";
import { AnimeContext } from "@/components/context/AnimeContext";

import { useToast } from "@/hooks/useToast";

import type { AnimeList } from "@/types/anime.type";
import { MetadataResponse } from "@/types/api.type";

import { Loader2Icon } from "lucide-react";
import Image from "next/image";

const PAGINATION_SIZE = 15;

type Props = {
  initialAnimeList: AnimeList[];
  initialAnimeMetadata: MetadataResponse;
};

export default function AnimeListSection({
  initialAnimeList,
  initialAnimeMetadata
}: Props) {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error("AnimeList must be used within an AnimeProvider");
  }

  const { state } = context;

  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const [animeList, setAnimeList] = useState<AnimeList[]>(initialAnimeList);
  const [animeMetadata, setAnimeMetadata] =
    useState<MetadataResponse>(initialAnimeMetadata);
  const [isLoadingAnime, setIsLoadingAnime] = useState(false);

  const isFirstRender = useRef(true);

  const fetchAnimeList = useCallback(async () => {
    setIsLoadingAnime(true);
    const response = await fetchAllAnimeService(
      state.page,
      PAGINATION_SIZE,
      state.query,
      state.filters.sortBy,
      state.filters.sortOrder,
      state.filters.filterGenre,
      state.filters.filterStudio,
      state.filters.filterTheme,
      state.filters.filterProgressStatus,
      state.filters.filterMALScore,
      state.filters.filterPersonalScore,
      state.filters.filterType
    );
    if (response.success) {
      setAnimeList(response.data.data);
      setAnimeMetadata(response.data.metadata);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAnime(false);
  }, [state]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    fetchAnimeList();
  }, [fetchAnimeList]);

  return isLoadingAnime ? (
    <section className="flex flex-col items-center justify-center flex-1">
      <div className="flex items-center justify-center gap-2 xl:gap-4">
        <Loader2Icon className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
        <h2>Fetching animes...</h2>
      </div>
    </section>
  ) : animeList.length === 0 ? (
    <section className="flex flex-col items-center justify-center flex-1">
      <div className="flex flex-col items-center justify-center gap-2">
        <Image
          src="/no-result.gif"
          width={128}
          height={128}
          className="w-32 h-32 rounded-xl"
          alt="No result"
        />
        <h2>No results.</h2>
      </div>
    </section>
  ) : (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {animeList.map((anime) => {
          return <AnimeCard key={anime.id} anime={anime} />;
        })}
      </div>
      <AnimePagination animeMetadata={animeMetadata} />
    </section>
  );
}
