import { LightNovelDetail } from "@/types/lightnovel.type";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { Star, ExternalLink } from "lucide-react";

type Props = {
  lightNovelDetail: LightNovelDetail;
};

export default function AboutTab({ lightNovelDetail }: Props) {
  return (
    <TabsContent value="about">
      <div className="flex flex-col gap-4 pt-4">
        <h2>About</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Title</Label>
            <p className="break-words">{lightNovelDetail.title}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Title (Japanese)</Label>
            <p className="break-words">{lightNovelDetail.titleJapanese}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Published</Label>
            <p>{lightNovelDetail.published}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Chapters</Label>
            <p>{lightNovelDetail.chaptersCount ?? "Unknown"}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Volumes</Label>
            <p>{lightNovelDetail.volumesCount ?? "Unknown"}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">MAL Score</Label>
            <span className="inline-flex items-center gap-1">
              <Star className="w-4 h-4" /> {lightNovelDetail.score ?? "N/A"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">MAL Entry</Label>
            <a
              href={lightNovelDetail.malUrl}
              className="inline-flex items-center gap-1 hover:underline hover:underline-offset-4"
              target="_blank"
            >
              Visit MAL
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 col-span-1 lg:col-span-3 gap-8">
            {lightNovelDetail.authors.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground">Authors</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {lightNovelDetail.authors.map((author) => {
                    return <Badge key={author.id}>{author.name}</Badge>;
                  })}
                </div>
              </div>
            )}
            {lightNovelDetail.genres.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground">Genres</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {lightNovelDetail.genres.map((genre) => {
                    return <Badge key={genre.id}>{genre.name}</Badge>;
                  })}
                </div>
              </div>
            )}
            {lightNovelDetail.themes.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground">Themes</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {lightNovelDetail.themes.map((theme) => {
                    return <Badge key={theme.id}>{theme.name}</Badge>;
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
