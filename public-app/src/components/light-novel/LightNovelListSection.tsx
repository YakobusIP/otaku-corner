"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { fetchAllLightNovelService } from "@/services/lightnovel.service";

import { LightNovelContext } from "@/components/context/LightNovelContext";
import LightNovelCard from "@/components/light-novel/LightNovelCard";
import LightNovelPagination from "@/components/light-novel/LightNovelPagination";

import { useToast } from "@/hooks/useToast";

import { MetadataResponse } from "@/types/api.type";
import type { LightNovelList } from "@/types/lightnovel.type";

import { Loader2Icon } from "lucide-react";
import Image from "next/image";

const PAGINATION_SIZE = 15;

type Props = {
  initialLightNovelList: LightNovelList[];
  initialLightNovelMetadata: MetadataResponse;
};

export default function LightNovelListSection({
  initialLightNovelList,
  initialLightNovelMetadata
}: Props) {
  const context = useContext(LightNovelContext);
  if (!context) {
    throw new Error("LightNovelList must be used within an LightNovelProvider");
  }

  const { state } = context;

  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const [lightNovelList, setLightNovelList] = useState<LightNovelList[]>(
    initialLightNovelList
  );
  const [lightNovelMetadata, setLightNovelMetadata] =
    useState<MetadataResponse>(initialLightNovelMetadata);
  const [isLoadingLightNovel, setIsLoadingLightNovel] = useState(false);

  const isFirstRender = useRef(true);

  const fetchLightNovelList = useCallback(async () => {
    setIsLoadingLightNovel(true);
    const response = await fetchAllLightNovelService(
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
      setLightNovelList(response.data.data);
      setLightNovelMetadata(response.data.metadata);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingLightNovel(false);
  }, [state]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    fetchLightNovelList();
  }, [fetchLightNovelList]);

  return isLoadingLightNovel ? (
    <section className="flex flex-col items-center justify-center flex-1">
      <div className="flex items-center justify-center gap-2 xl:gap-4">
        <Loader2Icon className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
        <h2>Fetching light novels...</h2>
      </div>
    </section>
  ) : lightNovelList.length === 0 ? (
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
        {lightNovelList.map((lightNovel) => {
          return <LightNovelCard key={lightNovel.id} lightNovel={lightNovel} />;
        })}
      </div>
      <LightNovelPagination lightNovelMetadata={lightNovelMetadata} />
    </section>
  );
}
