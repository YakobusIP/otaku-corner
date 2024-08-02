import { AnimePostRequest } from "@/types/anime.type";
import { TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type Props = {
  animeDetail: AnimePostRequest;
};

export default function EpisodeTab({ animeDetail }: Props) {
  return (
    <TabsContent value="episodes">
      <div className="flex flex-col gap-4 pt-4">
        <h2>Episodes</h2>
        <Table>
          <TableCaption>{animeDetail.title}'s list of episodes</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Episode number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Airing Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animeDetail.episodes.map((episode) => (
              <TableRow key={episode.number}>
                <TableCell className="font-medium">{episode.number}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <h4>{episode.title}</h4>
                    <p className="text-muted-foreground">
                      {episode.titleRomaji} ({episode.titleJapanese})
                    </p>
                  </div>
                </TableCell>
                <TableCell>{episode.aired}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
}
