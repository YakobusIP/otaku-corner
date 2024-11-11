import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";
import { Separator } from "@/components/ui/separator";

import { MangaList } from "@/types/manga.type";

import { HeartIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  manga: MangaList;
};

export default function MangaCard({ manga }: Props) {
  return (
    <Link href={`/manga/${manga.id}`}>
      <Card className="hover:drop-shadow-xl">
        <div className="relative">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={manga.images.large_image_url ?? manga.images.image_url}
              alt={manga.title}
              className="rounded-t-lg object-cover w-full h-full"
              width={300}
              height={400}
            />
          </div>
          <span className="absolute flex gap-2 items-center justify-center right-0 bottom-4 bg-primary/60 text-white p-2">
            <StarIcon />
            {manga.score.toFixed(2)}
          </span>
          {manga.personalScore && (
            <span className="absolute flex gap-2 items-center justify-center right-0 bottom-16 bg-primary/60 text-white p-2">
              <HeartIcon />
              {manga.personalScore.toFixed(2)}
            </span>
          )}
        </div>
        <Separator />
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col">
            <p className="text-lg font-medium truncate">{manga.title}</p>
            <p className="text-muted-foreground text-sm truncate">
              {manga.titleJapanese}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <ProgressStatusBadge progressStatus={manga.progressStatus} />
            <Badge>{manga.status}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
