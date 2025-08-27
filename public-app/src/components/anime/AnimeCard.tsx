import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

import { AnimeList } from "@/types/anime.type";

import { HeartIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  anime: AnimeList;
};

export default function AnimeCard({ anime }: Props) {
  return (
    <Link href={`/anime/${anime.id}/${anime.slug}`}>
      <Card className="h-full max-h-[550px] flex flex-col bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer group">
        <div className="relative">
          <Image
            src={anime.images.large_image_url ?? anime.images.image_url}
            alt={anime.title}
            className="aspect-[3/4] object-cover w-full h-full rounded-t-lg"
            width={300}
            height={400}
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <StarIcon size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-medium">
                {anime.score.toFixed(2)}
              </span>
            </div>
            {anime.personalScore && (
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <HeartIcon size={12} className="text-red-400 fill-red-400" />
                <span className="text-white text-xs font-medium">
                  {anime.personalScore.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="absolute top-2 right-2">
            <ProgressStatusBadge
              progressStatus={anime.progressStatus}
              className="text-white"
            />
          </div>
        </div>

        <CardContent className="p-4 flex flex-col flex-1">
          <h2 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 group-hover:text-slate-900">
            {anime.title}
          </h2>
          <p className="text-slate-600 text-xs mb-3 line-clamp-1">
            {anime.titleJapanese}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            <Badge
              variant="outline"
              className="text-xs border-slate-300 text-slate-600"
            >
              {anime.rating}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-slate-300 text-slate-600"
            >
              {anime.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 mt-auto">
            <span className="bg-slate-800 text-white px-2 py-1 rounded">
              {anime.type}
            </span>
            {anime.season ? (
              <span>{anime.season.slice(-4)}</span>
            ) : anime.aired ? (
              <span>{anime.aired.slice(-4)}</span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
