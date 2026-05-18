"use client";

import HomeCard from "@/components/home/HomeCard";

import { useHomeStatistics } from "@/hooks/useHomeStatistics";

import { MEDIA_TYPE } from "@/lib/enums";
import { formatScoreFixedOrNa } from "@/lib/utils";

export default function TopMedias() {
  const { topMediasQuery } = useHomeStatistics();
  const { data } = topMediasQuery;

  const topMedias = [
    {
      id: 1,
      cardTitle: "Anime Watched This Year",
      amount: data?.anime.count ?? 0,
      type: MEDIA_TYPE.ANIME,
      path: {
        pathname: "/anime"
      },
      image:
        data?.anime.images?.large_image_url ||
        data?.anime.images?.image_url ||
        "/placeholder.svg",
      mediaEnglishTitle: data?.anime.title || "",
      mediaJapaneseTitle: data?.anime.titleJapanese || "",
      topMediaPath:
        data?.anime.id && data?.anime.slug
          ? `/anime/${data?.anime.id}/${data?.anime.slug}`
          : "/anime",
      rating: formatScoreFixedOrNa(data?.anime.score)
    },
    {
      id: 2,
      cardTitle: "Manga Read This Year",
      amount: data?.manga.count ?? 0,
      type: MEDIA_TYPE.MANGA,
      path: {
        pathname: "/manga"
      },
      image:
        data?.manga.images?.large_image_url ||
        data?.manga.images?.image_url ||
        "/placeholder.svg",
      mediaEnglishTitle: data?.manga.title || "",
      mediaJapaneseTitle: data?.manga.titleJapanese || "",
      topMediaPath:
        data?.manga.id && data?.manga.slug
          ? `/manga/${data?.manga.id}/${data?.manga.slug}`
          : "/manga",
      rating: formatScoreFixedOrNa(data?.manga.score)
    },
    {
      id: 3,
      cardTitle: "Light Novels Read This Year",
      amount: data?.lightNovel.count ?? 0,
      type: MEDIA_TYPE.LIGHT_NOVEL,
      path: {
        pathname: "/light-novel"
      },
      image:
        data?.lightNovel.images?.large_image_url ||
        data?.lightNovel.images?.image_url ||
        "/placeholder.svg",
      mediaEnglishTitle: data?.lightNovel.title || "",
      mediaJapaneseTitle: data?.lightNovel.titleJapanese || "",
      topMediaPath:
        data?.lightNovel.id && data?.lightNovel.slug
          ? `/light-novel/${data?.lightNovel.id}/${data?.lightNovel.slug}`
          : "/light-novel",
      rating: formatScoreFixedOrNa(data?.lightNovel.score)
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 place-items-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
            <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {new Date().getFullYear()}
            </span>{" "}
            Progress
          </h2>
          <p className="text-slate-700 max-w-2xl mx-auto">
            Track my journey through anime, manga, and light novels this year
            with detailed reviews and ratings.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-3 max-w-6xl">
          {topMedias.map((media) => {
            return <HomeCard key={media.id} {...media} />;
          })}
        </div>
      </div>
    </section>
  );
}
