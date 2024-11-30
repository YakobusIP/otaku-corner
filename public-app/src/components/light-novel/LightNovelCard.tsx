import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";
import { Separator } from "@/components/ui/separator";

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
      <Card className="hover:drop-shadow-xl">
        <div className="relative">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={
                lightNovel.images.large_image_url ?? lightNovel.images.image_url
              }
              alt={lightNovel.title}
              className="rounded-t-lg object-cover w-full h-full"
              width={300}
              height={400}
            />
          </div>
          <span className="absolute flex gap-2 items-center justify-center right-0 bottom-4 bg-primary/60 text-white p-2">
            <StarIcon />
            {lightNovel.score.toFixed(2)}
          </span>
          {lightNovel.personalScore && (
            <span className="absolute flex gap-2 items-center justify-center right-0 bottom-16 bg-primary/60 text-white p-2">
              <HeartIcon />
              {lightNovel.personalScore.toFixed(2)}
            </span>
          )}
        </div>
        <Separator />
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col">
            <p className="text-lg font-medium truncate">{lightNovel.title}</p>
            <p className="text-muted-foreground text-sm truncate">
              {lightNovel.titleJapanese}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <ProgressStatusBadge progressStatus={lightNovel.progressStatus} />
            <Badge>{lightNovel.status}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
