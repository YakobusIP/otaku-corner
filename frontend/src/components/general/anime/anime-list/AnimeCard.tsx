import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnimeList } from "@/types/anime.type";
import { Link } from "react-router-dom";

type Props = {
  anime: AnimeList;
};

export default function AnimeCard({ anime }: Props) {
  return (
    <Link to={"detail/" + anime.id}>
      <Card>
        <img
          src={anime.images.large_image_url ?? anime.images.image_url}
          alt={anime.title}
          className="rounded-t-lg object-cover aspect-[3/4]"
        />
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col">
            <p className="text-lg font-medium truncate">{anime.title}</p>
            <p className="text-muted-foreground text-sm truncate">
              {anime.titleJapanese}
            </p>
          </div>
          <div className="flex justify-between items-center">
            {anime.score && <Badge>MAL Score : {anime.score}</Badge>}
            {anime.personalScore && (
              <Badge>Personal Score : {anime.personalScore}</Badge>
            )}
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
