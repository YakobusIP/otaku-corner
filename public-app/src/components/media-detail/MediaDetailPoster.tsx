import { ClapperboardIcon } from "lucide-react";
import Image from "next/image";

type MediaDetailPosterProps = {
  posterUrl: string;
  title: string;
  trailerEmbedUrl?: string;
};

export default function MediaDetailPoster({
  posterUrl,
  title,
  trailerEmbedUrl
}: MediaDetailPosterProps) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/45 p-4 shadow-md shadow-rose-100/30 backdrop-blur-md">
      <Image
        src={posterUrl}
        alt={title}
        width={320}
        height={440}
        className="aspect-3/4 w-full rounded-xl border border-rose-100/80 object-cover shadow-md"
        priority
      />

      {trailerEmbedUrl ? (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ClapperboardIcon className="size-4 text-rose-400" aria-hidden />
            Trailer
          </p>
          <div className="overflow-hidden rounded-xl border border-rose-100/80 bg-slate-900/5">
            <div className="aspect-video">
              <iframe
                className="size-full"
                src={trailerEmbedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${title} trailer`}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
