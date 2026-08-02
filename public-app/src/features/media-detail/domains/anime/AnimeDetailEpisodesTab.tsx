import { CardContent } from "@/components/ui/card";

import { AnimeDetail } from "@/types/anime.type";

type AnimeDetailEpisodesTabProps = {
  episodes: AnimeDetail["episodes"];
};

export default function AnimeDetailEpisodesTab({
  episodes
}: AnimeDetailEpisodesTabProps) {
  return (
    <CardContent className="pt-6">
      <div className="space-y-2">
        {episodes.map((episode) => {
          return (
            <div
              key={episode.id}
              className="rounded-lg border border-white/40 bg-white/30 p-4 backdrop-blur-sm transition-colors hover:bg-white/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-8 rounded bg-white/40 px-2 py-1 text-center font-mono text-sm text-slate-700">
                    {episode.number.toString().padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-medium text-slate-800">
                      {episode.title}
                    </h3>

                    <div className="flex flex-col gap-2 text-sm text-slate-600 lg:flex-row lg:gap-4">
                      {episode.titleRomaji ? (
                        <span>
                          {episode.titleRomaji}{" "}
                          {episode.titleJapanese &&
                            `(${episode.titleJapanese})`}
                        </span>
                      ) : null}
                      <span>{episode.aired}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  );
}
