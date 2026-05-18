import { FlowerIcon } from "lucide-react";

export default function HomeQuoteSection() {
  return (
    <section className="relative z-10 flex min-h-[510px] items-center justify-center px-12 pb-0 pt-0 lg:min-h-[540px]">
      <div className="max-w-2xl text-center">
        <blockquote className="text-pretty text-2xl font-medium leading-relaxed text-[#4a2a46] drop-shadow-[0_2px_18px_rgba(255,255,255,0.9)] sm:text-3xl">
          My personal curated selections.
          <br />
          And this is where I keep track of them.
        </blockquote>
        <div className="mt-6 flex items-center justify-center gap-4 text-rose-400">
          <span className="h-px w-20 md:w-40 bg-current" />
          <FlowerIcon className="h-8 w-8" aria-hidden />
          <span className="h-px w-20 md:w-40 bg-current" />
        </div>
      </div>
    </section>
  );
}
