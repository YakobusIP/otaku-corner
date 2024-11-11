import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";
import { TabsContent } from "@/components/ui/tabs";

import { AnimeDetail } from "@/types/anime.type";

import { ExternalLinkIcon, StarIcon } from "lucide-react";

type Props = {
  animeDetail: AnimeDetail;
};

export default function AboutTab({ animeDetail }: Props) {
  return (
    <TabsContent value="about">
      <div className="flex flex-col gap-4 pt-4">
        <h2>About</h2>
        <div className="flex flex-wrap items-center gap-2">
          {animeDetail.progressStatus && (
            <ProgressStatusBadge progressStatus={animeDetail.progressStatus} />
          )}
          <Badge>{animeDetail.type}</Badge>
          <Badge>{animeDetail.status}</Badge>
          <Badge>{animeDetail.rating}</Badge>
          {animeDetail.season && <Badge>{animeDetail.season}</Badge>}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Title</Label>
            <p className="break-words">{animeDetail.title}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Title (Japanese)</Label>
            <p className="break-words">{animeDetail.titleJapanese}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Source</Label>
            <p className="break-words">{animeDetail.source}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Aired</Label>
            <p>{animeDetail.aired}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Broadcast</Label>
            <p>{animeDetail.broadcast}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Episodes</Label>
            <p>{animeDetail.episodesCount ?? "Unknown"}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Duration</Label>
            <p>{animeDetail.duration}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">MAL Score</Label>
            <span className="inline-flex items-center gap-1">
              <StarIcon className="w-4 h-4" /> {animeDetail.score ?? "N/A"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">MAL Entry</Label>
            <a
              href={animeDetail.malUrl}
              className="inline-flex items-center gap-1 hover:underline hover:underline-offset-4"
              target="_blank"
            >
              Visit MAL
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 col-span-1 xl:col-span-3 gap-8">
            {animeDetail.genres.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground">Genres</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {animeDetail.genres.map((genre) => {
                    return <Badge key={genre.id}>{genre.name}</Badge>;
                  })}
                </div>
              </div>
            )}
            {animeDetail.themes.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground">Themes</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {animeDetail.themes.map((theme) => {
                    return <Badge key={theme.id}>{theme.name}</Badge>;
                  })}
                </div>
              </div>
            )}
            {animeDetail.studios.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground">Studios</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {animeDetail.studios.map((studio) => {
                    return <Badge key={studio.id}>{studio.name}</Badge>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
