import { cache } from "react";

import { lightNovelService } from "@/services/lightnovel.service";

import LightNovelDetail from "@/components/light-novel/LightNovelDetail";

import { LightNovelDetail as LightNovelDetailType } from "@/types/lightnovel.type";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: number; slug: string }>;
};

const getCachedLightNovelData = cache(async (id: number) => {
  const queryClient = new QueryClient();

  await queryClient.fetchQuery({
    queryKey: ["lightNovel", id],
    queryFn: () => lightNovelService.fetchById(id),
    retry: false
  });

  return {
    queryClient,
    data: queryClient.getQueryData<LightNovelDetailType>(["lightNovel", id])
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const slug = (await params).slug;

  try {
    const { data } = await getCachedLightNovelData(id);

    if (!data) {
      return {
        title: `Light Novel Review | Otaku Corner`,
        description: `Get bearking58's take on light novels, with a detailed review and rating. Find out what sets this light novel apart or why it may not be worth your time.`
      };
    }

    return {
      title: `${data.title} Light Novel Review | Otaku Corner`,
      description: `Get bearking58's take on ${data.title}, with a detailed review and rating. Find out what sets this light novel apart or why it may not be worth your time.`,
      alternates: {
        canonical: `/light-novel/${id}/${slug}`
      }
    };
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    return {
      title: `Light Novel Review | Otaku Corner`,
      description: `Get bearking58's take on light novels, with a detailed review and rating. Find out what sets this light novel apart or why it may not be worth your time.`
    };
  }
}

export default async function Page({ params }: Props) {
  const id = (await params).id;

  const { queryClient } = await getCachedLightNovelData(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LightNovelDetail id={id} />
    </HydrationBoundary>
  );
}
