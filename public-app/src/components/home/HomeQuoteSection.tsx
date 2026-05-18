import { Flower2Icon } from "lucide-react";

export default function HomeQuoteSection() {
  return (
    <section className="relative z-10 flex min-h-[170px] items-center justify-center px-6 pb-0 pt-0 lg:min-h-[180px]">
      <div className="max-w-2xl text-center">
        <span
          className="mb-3 block text-6xl leading-none text-rose-400/45 sm:text-7xl"
          aria-hidden
        >
          &ldquo;
        </span>
        <blockquote className="text-pretty text-2xl font-medium leading-relaxed text-[#4a2a46] drop-shadow-[0_2px_18px_rgba(255,255,255,0.9)] sm:text-3xl">
          Stories stay with me.
          <br />
          And this is where I keep track of them.
        </blockquote>
        <div className="mt-6 flex items-center justify-center gap-4 text-rose-400/70">
          <span className="h-px w-20 bg-current" />
          <Flower2Icon className="h-8 w-8" aria-hidden />
          <span className="h-px w-20 bg-current" />
        </div>
      </div>
    </section>
  );
}
