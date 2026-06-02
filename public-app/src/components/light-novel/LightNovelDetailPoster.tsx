import Image from "next/image";

type LightNovelDetailPosterProps = {
  posterUrl: string;
  title: string;
};

export default function LightNovelDetailPoster({
  posterUrl,
  title
}: LightNovelDetailPosterProps) {
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
    </div>
  );
}
