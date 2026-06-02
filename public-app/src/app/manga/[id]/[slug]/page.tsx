import { cache } from "react";

import { mangaService } from "@/services/manga.service";

import MangaDetail from "@/components/manga/MangaDetailConfig";

import { MangaDetail as MangaDetailType } from "@/types/manga.type";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: number; slug: string }>;
};

const getCachedMangaData = cache(async (id: number) => {
  const queryClient = new QueryClient();

  await queryClient.fetchQuery({
    queryKey: ["manga", id],
    queryFn: () => mangaService.fetchById(id),
    retry: false
  });

  return {
    queryClient,
    data: queryClient.getQueryData<MangaDetailType>(["manga", id])
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const slug = (await params).slug;

  try {
    const { data } = await getCachedMangaData(id);

    if (!data) {
      return {
        title: `Manga Review | Otaku Corner`,
        description: `Delve into bearking58's manga review, providing a unique perspective and rating. Learn why this manga stands out or falls short in the collection.`
      };
    }

    return {
      title: `${data.title} Manga Review | Otaku Corner`,
      description: `Delve into bearking58's review of ${data.title}, providing a unique perspective and rating. Learn why this manga stands out or falls short in the collection.`,
      alternates: {
        canonical: `/manga/${id}/${slug}`
      }
    };
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    return {
      title: `Manga Review | Otaku Corner`,
      description: `Delve into bearking58's manga review, providing a unique perspective and rating. Learn why this manga stands out or falls short in the collection.`
    };
  }
}

export default async function Page({ params }: Props) {
  const id = (await params).id;

  const { queryClient } = await getCachedMangaData(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MangaDetail id={id} />
    </HydrationBoundary>
  );
}
