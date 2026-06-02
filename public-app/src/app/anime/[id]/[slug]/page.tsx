import { cache } from "react";

import { animeService } from "@/services/anime.service";

import AnimeDetail from "@/components/anime/AnimeDetailConfig";

import { AnimeDetail as AnimeDetailType } from "@/types/anime.type";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: number; slug: string }>;
};

const getCachedAnimeData = cache(async (id: number) => {
  const queryClient = new QueryClient();

  await queryClient.fetchQuery({
    queryKey: ["anime", id],
    queryFn: () => animeService.fetchById(id),
    retry: false
  });

  return {
    queryClient,
    data: queryClient.getQueryData<AnimeDetailType>(["anime", id])
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const slug = (await params).slug;

  try {
    const { data } = await getCachedAnimeData(id);

    if (!data) {
      return {
        title: `Anime Review | Otaku Corner`,
        description: `Read bearking58's in-depth review of animes, offering a personal perspective and rating. Uncover what makes this anime a hit or miss in the collection.`
      };
    }

    return {
      title: `${data.title} Anime Review | Otaku Corner`,
      description: `Read bearking58's in-depth review of ${data.title}, offering a personal perspective and rating. Uncover what makes this anime a hit or miss in the collection.`,
      alternates: {
        canonical: `/anime/${id}/${slug}`
      }
    };
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    return {
      title: `Anime Review | Otaku Corner`,
      description: `Read bearking58's in-depth review of animes, offering a personal perspective and rating. Uncover what makes this anime a hit or miss in the collection.`
    };
  }
}

export default async function Page({ params }: Props) {
  const id = (await params).id;

  const { queryClient } = await getCachedAnimeData(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnimeDetail id={id} />
    </HydrationBoundary>
  );
}
