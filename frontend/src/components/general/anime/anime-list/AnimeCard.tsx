import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnimeList } from "@/types/anime.type";
import { Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  anime: AnimeList;
};

export default function AnimeCard({ anime }: Props) {
  return (
    <Link to={`/anime/${anime.id}`}>
      <Card>
        <div className="relative">
          <img
            src={anime.images.large_image_url ?? anime.images.image_url}
            alt={anime.title}
            className="rounded-t-lg object-cover aspect-[3/4]"
          />
          <span className="absolute flex gap-2 items-center justify-center right-0 bottom-4 bg-primary/60 text-white p-2">
            <Star />
            {anime.score.toFixed(2)}
          </span>
          {anime.personalScore && (
            <span className="absolute flex gap-2 items-center justify-center right-0 bottom-16 bg-primary/60 text-white p-2">
              <Heart />
              {anime.personalScore.toFixed(2)}
            </span>
          )}
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col">
            <p className="text-lg font-medium truncate">{anime.title}</p>
            <p className="text-muted-foreground text-sm truncate">
              {anime.titleJapanese}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>{anime.rating}</Badge>
            <Badge>{anime.type}</Badge>
            <Badge>{anime.status}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
