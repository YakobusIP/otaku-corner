import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

import { LightNovelList } from "@/types/lightnovel.type";

import { HeartIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  lightNovel: LightNovelList;
};

export default function LightNovelCard({ lightNovel }: Props) {
  return (
    <Link href={`/light-novel/${lightNovel.id}/${lightNovel.slug}`}>
      <Card className="h-full max-h-[475px] flex flex-col bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer group">
        <div className="relative">
          <Image
            src={
              lightNovel.images.large_image_url ?? lightNovel.images.image_url
            }
            alt={lightNovel.title}
            className="aspect-[3/4] object-cover w-full h-full rounded-t-lg"
            width={300}
            height={400}
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <StarIcon size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-medium">
                {lightNovel.score.toFixed(2)}
              </span>
            </div>
            {lightNovel.personalScore && (
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <HeartIcon size={12} className="text-red-400 fill-red-400" />
                <span className="text-white text-xs font-medium">
                  {lightNovel.personalScore.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="absolute top-2 right-2">
            <ProgressStatusBadge
              progressStatus={lightNovel.progressStatus}
              className="text-white"
            />
          </div>
        </div>

        <CardContent className="p-4 flex flex-col flex-1">
          <h2 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 group-hover:text-slate-900">
            {lightNovel.title}
          </h2>
          <p className="text-slate-600 text-xs mb-3 line-clamp-1">
            {lightNovel.titleJapanese}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            <Badge
              variant="outline"
              className="text-xs border-slate-300 text-slate-600"
            >
              {lightNovel.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
