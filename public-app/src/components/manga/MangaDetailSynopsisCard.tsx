import { FlowerIcon } from "lucide-react";

type MangaDetailSynopsisCardProps = {
  synopsis: string;
};

export default function MangaDetailSynopsisCard({
  synopsis
}: MangaDetailSynopsisCardProps) {
  return (
    <section className="rounded-2xl border border-white/50 bg-white/45 p-6 shadow-md shadow-rose-100/30 backdrop-blur-md">
      <header className="mb-4 flex items-center gap-2">
        <FlowerIcon className="size-5 text-rose-400" aria-hidden />
        <h2 className="text-lg font-bold text-slate-800">Synopsis</h2>
      </header>
      <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700 lg:text-base">
        {synopsis}
      </p>
    </section>
  );
}
