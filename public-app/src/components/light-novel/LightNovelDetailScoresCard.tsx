import MediaDetailScoresCardCore from "@/components/media-detail/MediaDetailScoresCardCore";

import { LightNovelDetail } from "@/types/lightnovel.type";

import { formatLightNovelVolumesLabel } from "@/lib/media-detail-helpers";

import { BookOpenIcon } from "lucide-react";

type LightNovelDetailScoresCardProps = {
  lightNovelDetail: LightNovelDetail;
};

export default function LightNovelDetailScoresCard({
  lightNovelDetail
}: LightNovelDetailScoresCardProps) {
  const reviewObject = lightNovelDetail.review;
  const volumesLabel = formatLightNovelVolumesLabel(
    lightNovelDetail.volumesCount
  );

  return (
    <MediaDetailScoresCardCore
      malScore={lightNovelDetail.score}
      personalScore={reviewObject?.personalScore}
      progressStatusLabel="Reading Status"
      review={reviewObject}
      footer={
        <div className="mt-4 space-y-2 border-t border-slate-200/80 pt-4">
          <p className="text-sm text-slate-500">Series Progress</p>
          <div className="flex items-center gap-2 rounded-lg border border-white/40 bg-white/30 px-3 py-2.5 backdrop-blur-sm">
            <BookOpenIcon
              className="size-4 shrink-0 text-[#ff6b8b]"
              aria-hidden
            />
            <p className="text-sm font-medium text-slate-800">{volumesLabel}</p>
          </div>
        </div>
      }
    />
  );
}
