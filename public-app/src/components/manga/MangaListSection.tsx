"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { fetchAllMangaService } from "@/services/manga.service";

import { MangaContext } from "@/components/context/MangaContext";
import MangaCard from "@/components/manga/MangaCard";
import MangaPagination from "@/components/manga/MangaPagination";

import { useToast } from "@/hooks/useToast";

import { MetadataResponse } from "@/types/api.type";
import type { MangaList } from "@/types/manga.type";

import { Loader2Icon } from "lucide-react";
import Image from "next/image";

const PAGINATION_SIZE = 15;

type Props = {
  initialMangaList: MangaList[];
  initialMangaMetadata: MetadataResponse;
};

export default function MangaListSection({
  initialMangaList,
  initialMangaMetadata
}: Props) {
  const context = useContext(MangaContext);
  if (!context) {
    throw new Error("MangaList must be used within an MangaProvider");
  }

  const { state } = context;

  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const [mangaList, setMangaList] = useState<MangaList[]>(initialMangaList);
  const [mangaMetadata, setMangaMetadata] =
    useState<MetadataResponse>(initialMangaMetadata);
  const [isLoadingManga, setIsLoadingManga] = useState(false);

  const isFirstRender = useRef(true);

  const fetchMangaList = useCallback(async () => {
    setIsLoadingManga(true);
    const response = await fetchAllMangaService(
      state.page,
      PAGINATION_SIZE,
      state.query,
      state.filters.sortBy,
      state.filters.sortOrder,
      state.filters.filterAuthor,
      state.filters.filterGenre,
      state.filters.filterTheme,
      state.filters.filterProgressStatus,
      state.filters.filterMALScore,
      state.filters.filterPersonalScore
    );
    if (response.success) {
      setMangaList(response.data.data);
      setMangaMetadata(response.data.metadata);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingManga(false);
  }, [state]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    fetchMangaList();
  }, [fetchMangaList]);

  return isLoadingManga ? (
    <section className="flex flex-col items-center justify-center flex-1">
      <div className="flex items-center justify-center gap-2 xl:gap-4">
        <Loader2Icon className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
        <h2>Fetching mangas...</h2>
      </div>
    </section>
  ) : mangaList.length === 0 ? (
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
        {mangaList.map((manga) => {
          return <MangaCard key={manga.id} manga={manga} />;
        })}
      </div>
      <MangaPagination mangaMetadata={mangaMetadata} />
    </section>
  );
}
