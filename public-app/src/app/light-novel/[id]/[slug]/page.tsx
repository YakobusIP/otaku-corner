import { lightNovelService } from "@/services/lightnovel.service";

import LightNovelDetail from "@/components/light-novel/LightNovelDetailConfig";
import { createMediaDetailPage } from "@/components/media-detail/createMediaDetailPage";

const { generateMetadata, Page } = createMediaDetailPage({
  mediaType: "lightNovel",
  queryKey: (id) => ["lightNovel", id],
  fetchById: (id) => lightNovelService.fetchById(id),
  DetailComponent: LightNovelDetail,
  fallbackTitle: "Light Novel Review | Otaku Corner",
  description: (title) =>
    `Get bearking58's take on ${title}, with a detailed review and rating. Find out what sets this light novel apart or why it may not be worth your time.`,
  fallbackDescription: `Get bearking58's take on light novels, with a detailed review and rating. Find out what sets this light novel apart or why it may not be worth your time.`
});

export { generateMetadata };

export default Page;
