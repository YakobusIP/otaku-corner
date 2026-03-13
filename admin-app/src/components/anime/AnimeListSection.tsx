import { useContext, useEffect, useState } from "react";

import { animeService } from "@/services/anime.service";

import AnimePagination from "@/components/anime/AnimePagination";
import AnimeRow from "@/components/anime/AnimeRow";
import { AnimeContext } from "@/components/context/AnimeContext";

import { useToast } from "@/hooks/useToast";

import { PROGRESS_STATUS, SORT_ORDER } from "@/lib/enums";

import { useQuery } from "@tanstack/react-query";

const PAGINATION_SIZE = 10;

export default function AnimeListSection() {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error("AnimeList must be used within an AnimeProvider");
  }

  const { state, setState, setQuery } = context;
  const { page, query, status, filters, sort, order } = state;

  const toast = useToast();

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "animes",
      page,
      PAGINATION_SIZE,
      query,
      sort,
      order,
      filters.genre,
      filters.studio,
      filters.theme,
      status,
      filters.malScore,
      filters.personalScore,
      filters.type,
      filters.statusCheck
    ],
    queryFn: () =>
      animeService.fetchAll(
        page,
        PAGINATION_SIZE,
        query,
        sort,
        order as SORT_ORDER,
        filters.genre,
        filters.studio,
        filters.theme,
        status as keyof typeof PROGRESS_STATUS,
        filters.malScore,
        filters.personalScore,
        filters.type,
        filters.statusCheck
      )
  });

  const animeList = data?.data;
  const animeMetadata = data?.metadata;

  if (error) {
    toast.toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong",
      description: error.message
    });
  }

  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-lg overflow-hidden bg-card/70 backdrop-blur-xl border border-border/60">
      <div className="divide-y divide-border/50">
        {animeList?.map((anime) => <AnimeRow key={anime.id} anime={anime} />)}
      </div>

      {animeMetadata ? <AnimePagination animeMetadata={animeMetadata} /> : null}
    </div>
  );
}
