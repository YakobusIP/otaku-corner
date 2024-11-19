import EditChapterVolumes from "@/components/manga-detail/EditChapterVolumes";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ProgressStatusBadge } from "@/components/ui/progress-status-badge";
import { TabsContent } from "@/components/ui/tabs";

import { MangaDetail } from "@/types/manga.type";

import { ExternalLinkIcon, StarIcon } from "lucide-react";

type Props = {
  mangaDetail: MangaDetail;
  resetParent: () => Promise<void>;
};

export default function AboutTab({ mangaDetail, resetParent }: Props) {
  return (
    <TabsContent value="about">
      <div className="flex flex-col gap-4 pt-4">
        <h2>About</h2>
        <div className="flex flex-wrap items-center gap-2">
          <ProgressStatusBadge
            progressStatus={mangaDetail.review.progressStatus}
          />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Title</Label>
            <p className="break-words">{mangaDetail.title}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Title (Japanese)</Label>
            <p className="break-words">{mangaDetail.titleJapanese}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Published</Label>
            <p>{mangaDetail.published}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Chapters</Label>
            <p>{mangaDetail.chaptersCount ?? "Unknown"}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">Volumes</Label>
            <p>{mangaDetail.volumesCount ?? "Unknown"}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">MAL Score</Label>
            <span className="inline-flex items-center gap-1">
              <StarIcon className="w-4 h-4" /> {mangaDetail.score ?? "N/A"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground">MAL Entry</Label>
            <a
              href={mangaDetail.malUrl}
              className="inline-flex items-center gap-1 hover:underline hover:underline-offset-4"
              target="_blank"
            >
              Visit MAL
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 col-span-1 xl:col-span-3 gap-8">
            {mangaDetail.authors.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground">Authors</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {mangaDetail.authors.map((author) => {
                    return <Badge key={author.id}>{author.name}</Badge>;
                  })}
                </div>
              </div>
            )}
            {mangaDetail.genres.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground">Genres</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {mangaDetail.genres.map((genre) => {
                    return <Badge key={genre.id}>{genre.name}</Badge>;
                  })}
                </div>
              </div>
            )}
            {mangaDetail.themes.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground">Themes</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {mangaDetail.themes.map((theme) => {
                    return <Badge key={theme.id}>{theme.name}</Badge>;
                  })}
                </div>
              </div>
            )}
          </div>
          <EditChapterVolumes
            mangaDetail={mangaDetail}
            resetParent={resetParent}
          />
        </div>
      </div>
    </TabsContent>
  );
}
