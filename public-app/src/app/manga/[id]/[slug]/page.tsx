import { mangaService } from "@/services/manga.service";
import { createMediaDetailPage } from "@/components/media-detail/createMediaDetailPage";

import MangaDetail from "@/components/manga/MangaDetailConfig";

const { generateMetadata, Page } = createMediaDetailPage({
  mediaType: "manga",
  queryKey: (id) => ["manga", id],
  fetchById: (id) => mangaService.fetchById(id),
  DetailComponent: MangaDetail,
  fallbackTitle: "Manga Review | Otaku Corner",
  description: (title) =>
    `Delve into bearking58's review of ${title}, providing a unique perspective and rating. Learn why this manga stands out or falls short in the collection.`,
  fallbackDescription: `Delve into bearking58's manga review, providing a unique perspective and rating. Learn why this manga stands out or falls short in the collection.`
});

export { generateMetadata };

export default Page;