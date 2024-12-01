import { fetchTopMediaAndYearlyCountService } from "@/services/statistic.service";

import HomeCard from "@/components/home/HomeCard";

import { MEDIA_TYPE, SORT_ORDER } from "@/lib/enums";

import { redirect } from "next/navigation";

export default async function TopMedias() {
  const fetchHomeData = async () => {
    const response = await fetchTopMediaAndYearlyCountService();
    if (response.success) {
      return response.data;
    } else {
      console.error("Error on fetching home data:", response.error);
      redirect("/fetch-error");
    }
  };

  const homeData = await fetchHomeData();

  const topMedias = [
    {
      id: 1,
      cardTitle: "Anime Watched This Year",
      amount: homeData.anime.count,
      type: MEDIA_TYPE.ANIME,
      path: {
        pathname: "/anime",
        query: { page: "1", sortBy: "title", sortOrder: SORT_ORDER.ASCENDING }
      },
      image:
        homeData.anime.images?.large_image_url ||
        homeData.anime.images?.image_url ||
        "/placeholder.svg",
      mediaTitle: homeData.anime.title || "",
      topMediaPath:
        homeData.anime.id && homeData.anime.slug
          ? `/anime/${homeData.anime.id}/${homeData.anime.slug}`
          : "/anime",
      rating: homeData.anime.score ? homeData.anime.score.toFixed(2) : 0
    },
    {
      id: 2,
      cardTitle: "Manga Read This Year",
      amount: homeData.manga.count,
      type: MEDIA_TYPE.MANGA,
      path: {
        pathname: "/manga",
        query: { page: "1", sortBy: "title", sortOrder: SORT_ORDER.ASCENDING }
      },
      image:
        homeData.manga.images?.large_image_url ||
        homeData.manga.images?.image_url ||
        "/placeholder.svg",
      mediaTitle: homeData.manga.title || "",
      topMediaPath:
        homeData.manga.id && homeData.manga.slug
          ? `/manga/${homeData.manga.id}/${homeData.manga.slug}`
          : "/manga",
      rating: homeData.manga.score ? homeData.manga.score.toFixed(2) : 0
    },
    {
      id: 3,
      cardTitle: "Light Novels Read This Year",
      amount: homeData.lightNovel.count,
      type: MEDIA_TYPE.LIGHT_NOVEL,
      path: {
        pathname: "/light-novel",
        query: { page: "1", sortBy: "title", sortOrder: SORT_ORDER.ASCENDING }
      },
      image:
        homeData.lightNovel.images?.large_image_url ||
        homeData.lightNovel.images?.image_url ||
        "/placeholder.svg",
      mediaTitle: homeData.lightNovel.title || "",
      topMediaPath:
        homeData.lightNovel.id && homeData.lightNovel.slug
          ? `/light-novel/${homeData.lightNovel.id}/${homeData.lightNovel.slug}`
          : "/light-novel",
      rating: homeData.lightNovel.score
        ? homeData.lightNovel.score.toFixed(2)
        : 0
    }
  ];

  return (
    <section className="py-12 md:py-16 xl:py-20">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {topMedias.map((media) => {
            return <HomeCard key={media.id} {...media} />;
          })}
        </div>
      </div>
    </section>
  );
}
