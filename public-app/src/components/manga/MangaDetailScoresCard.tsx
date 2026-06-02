import MediaDetailScoresCardCore from "@/components/media-detail/MediaDetailScoresCardCore";

import { MangaDetail } from "@/types/manga.type";

import {
  formatMangaChaptersLabel,
  formatMangaVolumesLabel
} from "@/lib/media-detail-helpers";

import { BookOpenIcon, LibraryIcon } from "lucide-react";

type MangaDetailScoresCardProps = {
  mangaDetail: MangaDetail;
};

export default function MangaDetailScoresCard({
  mangaDetail
}: MangaDetailScoresCardProps) {
  const reviewObject = mangaDetail.review;
  const chaptersLabel = formatMangaChaptersLabel(mangaDetail.chaptersCount);
  const volumesLabel = formatMangaVolumesLabel(mangaDetail.volumesCount);

  return (
    <MediaDetailScoresCardCore
      malScore={mangaDetail.score}
      personalScore={reviewObject?.personalScore}
      progressStatusLabel="Reading Status"
      review={reviewObject}
      footer={
        <div className="mt-4 space-y-3 border-t border-slate-200/80 pt-4">
          <p className="text-sm text-slate-500">Series Info</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/40 bg-white/30 px-3 py-2.5 backdrop-blur-sm">
              <BookOpenIcon
                className="size-4 shrink-0 text-[#ff6b8b]"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Chapters</p>
                <p className="truncate text-sm font-medium text-slate-800">
                  {chaptersLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/40 bg-white/30 px-3 py-2.5 backdrop-blur-sm">
              <LibraryIcon
                className="size-4 shrink-0 text-[#ff6b8b]"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Volumes</p>
                <p className="truncate text-sm font-medium text-slate-800">
                  {volumesLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
