import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MangaList } from "@/types/manga.type";
import { Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  manga: MangaList;
};

export default function MangaCard({ manga }: Props) {
  return (
    <Link to={`/manga/${manga.id}`}>
      <Card className="hover:drop-shadow-xl">
        <div className="relative">
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={manga.images.large_image_url ?? manga.images.image_url}
              alt={manga.title}
              className="rounded-t-lg object-cover w-full h-full"
            />
          </div>
          <span className="absolute flex gap-2 items-center justify-center right-0 bottom-4 bg-primary/60 text-white p-2">
            <Star />
            {manga.score.toFixed(2)}
          </span>
          {manga.personalScore && (
            <span className="absolute flex gap-2 items-center justify-center right-0 bottom-16 bg-primary/60 text-white p-2">
              <Heart />
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
            <Badge>{manga.status}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
