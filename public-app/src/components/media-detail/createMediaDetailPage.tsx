import { NotFoundError } from "@/lib/api/axios";
import type { PublicMediaTypeId } from "@/lib/media/public-media-type";
import { PUBLIC_MEDIA_TYPE_CONFIG } from "@/lib/media/public-media-type";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate
} from "@tanstack/react-query";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, type JSX, ComponentType } from "react";

type DetailData = {
  title: string;
};

type CachedDataResult = {
  queryClient: QueryClient;
  data: DetailData | undefined;
};

type DetailPageConfig = {
  mediaType: PublicMediaTypeId;
  queryKey: (id: number) => readonly [string, number];
  fetchById: (id: number) => Promise<DetailData>;
  DetailComponent: ComponentType<{ id: number }>;
  fallbackTitle: string;
  description: (title: string) => string;
  fallbackDescription: string;
};

type Props = {
  params: Promise<{ id: string; slug: string }>;
};

const parseId = (raw: string): number => {
  if (!/^\d+$/.test(raw)) notFound();
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return id;
};

type DetailPageResult = {
  generateMetadata: (props: Props) => Promise<Metadata>;
  Page: (props: Props) => Promise<JSX.Element>;
};

export const createMediaDetailPage = ({
  mediaType,
  queryKey,
  fetchById,
  DetailComponent,
  fallbackTitle,
  description,
  fallbackDescription
}: DetailPageConfig): DetailPageResult => {
  const { detailPathSegment } = PUBLIC_MEDIA_TYPE_CONFIG[mediaType];

  const getCachedData = cache(async (id: number): Promise<CachedDataResult> => {
    const queryClient = new QueryClient();

    await queryClient.fetchQuery({
      queryKey: queryKey(id),
      queryFn: () => fetchById(id),
      retry: false
    });

    return {
      queryClient,
      data: queryClient.getQueryData<DetailData>(queryKey(id))
    };
  });

  const generateMetadata = async ({
    params
  }: Props): Promise<Metadata> => {
    const { id: rawId, slug } = await params;
    const id = parseId(rawId);

    try {
      const { data } = await getCachedData(id);

      if (!data) {
        return {
          title: fallbackTitle,
          description: fallbackDescription
        };
      }

      return {
        title: `${data.title} ${fallbackTitle}`,
        description: description(data.title),
        alternates: {
          canonical: `/${detailPathSegment}/${id}/${slug}`
        }
      };
    } catch (error) {
      if (error instanceof NotFoundError) notFound();
      console.error("Error in generateMetadata:", error);
      return {
        title: fallbackTitle,
        description: fallbackDescription
      };
    }
  };

  const Page = async ({ params }: Props) => {
    const { id: rawId } = await params;
    const id = parseId(rawId);

    let queryClient: QueryClient;
    try {
      ({ queryClient } = await getCachedData(id));
    } catch (error) {
      if (error instanceof NotFoundError) notFound();
      throw error;
    }

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DetailComponent id={id} />
      </HydrationBoundary>
    );
  };

  return { generateMetadata, Page };
};