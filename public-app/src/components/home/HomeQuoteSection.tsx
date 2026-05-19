import HomeQuoteTypewriter from "@/components/home/HomeQuoteTypewriter";
import SlideUpInView from "@/components/motion/SlideUpInView";

import { FlowerIcon } from "lucide-react";

export default function HomeQuoteSection() {
  return (
    <SlideUpInView
      as="section"
      className="relative z-10 flex min-h-[510px] items-center justify-center px-12 pb-0 pt-0 lg:min-h-[540px]"
    >
      <div className="max-w-2xl text-center">
        <HomeQuoteTypewriter />
        <div className="mt-6 flex items-center justify-center gap-4 text-rose-400">
          <span className="h-px w-20 md:w-40 bg-current" />
          <FlowerIcon className="h-8 w-8" aria-hidden />
          <span className="h-px w-20 md:w-40 bg-current" />
        </div>
      </div>
    </SlideUpInView>
  );
}
