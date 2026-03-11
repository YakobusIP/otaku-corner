import { Button } from "@/components/ui/button";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";

import { AnimeList } from "@/types/anime.type";

import {
  CheckCircleIcon,
  CircleIcon,
  EditIcon,
  HeartIcon,
  StarIcon,
  Trash2Icon
} from "lucide-react";

type Props = {
  anime: AnimeList;
};

export default function AnimeRow({ anime }: Props) {
  const episodesFetched =
    !["Movie", "OVA"].includes(anime.type) && anime.fetchedEpisode > 0;

  return (
    <div
      key={anime.id}
      className="p-3 md:p-4 hover:bg-muted/30 transition-colors"
    >
      <div className="flex gap-3 md:gap-4">
        <div className="flex-shrink-0">
          <img
            src={anime.images.large_image_url ?? anime.images.image_url}
            alt={anime.title}
            className="w-12 h-16 sm:w-16 sm:h-20 object-cover rounded-md border border-border/50"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:animes-start sm:justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                {anime.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {anime.titleJapanese}
              </p>
            </div>

            <div className="flex animes-center gap-2 flex-shrink-0">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                <EditIcon className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2Icon className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap animes-center gap-2 text-xs">
            <div className="flex animes-center gap-1">
              <span className="text-muted-foreground">Episodes:</span>
              <span className="font-medium">{anime.fetchedEpisode}</span>
            </div>
            <div className="flex animes-center gap-1">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{anime.type}</span>
            </div>
            {anime.season ? (
              <div className="flex animes-center gap-1">
                <span className="text-muted-foreground">Year:</span>
                <span className="font-medium">{anime.season.slice(-4)}</span>
              </div>
            ) : anime.aired ? (
              <div className="flex animes-center gap-1">
                <span className="text-muted-foreground">Year:</span>
                <span className="font-medium">{anime.aired.slice(-4)}</span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row sm:animes-center sm:justify-between gap-2">
            <div className="flex animes-center gap-3">
              <div className="flex animes-center gap-1">
                {["Movie", "OVA"].includes(anime.type) || episodesFetched ? (
                  <CheckCircleIcon className="h-3 w-3 text-green-500" />
                ) : (
                  <CircleIcon className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">Episodes</span>
              </div>
              <div className="flex animes-center gap-1">
                {anime.reviewText ? (
                  <CheckCircleIcon className="h-3 w-3 text-green-500" />
                ) : (
                  <CircleIcon className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">Review</span>
              </div>
              <div className="flex animes-center gap-1">
                {anime.consumedAt ? (
                  <CheckCircleIcon className="h-3 w-3 text-green-500" />
                ) : (
                  <CircleIcon className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">Date</span>
              </div>
            </div>

            <div className="flex animes-center gap-3">
              <div className="flex animes-center gap-1">
                <StarIcon className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs font-medium">
                  {anime.score.toFixed(2)}
                </span>
              </div>
              {anime.personalScore && (
                <div className="flex animes-center gap-1">
                  <HeartIcon className="h-3 w-3 text-blue-500 fill-current" />
                  <span className="text-xs font-medium">
                    {anime.personalScore.toFixed(2)}
                  </span>
                </div>
              )}
              <ProgressStatusBadge
                progressStatus={anime.progressStatus}
                className="text-white"
              />
              {/* <Badge
                variant={
                  anime.status === "completed"
                    ? "default"
                    : anime.status === "ongoing"
                      ? "secondary"
                      : anime.status === "planned"
                        ? "outline"
                        : "destructive"
                }
                className="text-xs capitalize"
              >
                {anime.status.replace("-", " ")}
              </Badge> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
