import { animeService } from "@/services/anime.service";

import AnimeDetail from "@/components/anime/AnimeDetailConfig";
import { createMediaDetailPage } from "@/components/media-detail/createMediaDetailPage";

const { generateMetadata, Page } = createMediaDetailPage({
  mediaType: "anime",
  queryKey: (id) => ["anime", id],
  fetchById: (id) => animeService.fetchById(id),
  DetailComponent: AnimeDetail,
  fallbackTitle: "Anime Review | Otaku Corner",
  description: (title) =>
    `Read bearking58's in-depth review of ${title}, offering a personal perspective and rating. Uncover what makes this anime a hit or miss in the collection.`,
  fallbackDescription: `Read bearking58's in-depth review of animes, offering a personal perspective and rating. Uncover what makes this anime a hit or miss in the collection.`
});

export { generateMetadata };

export default Page;
