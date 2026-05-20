import Image from "next/image";

import { cn } from "@/lib/utils";

type HomeUpperSectionImageProps = {
  priority?: boolean;
  className?: string;
};

export default function HomeUpperSectionImage({
  priority = false,
  className
}: HomeUpperSectionImageProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden
    >
      <Image
        src="/hero_upper_image.webp"
        alt=""
        fill
        priority={priority}
        className="object-cover object-[70%_center] md:object-center"
        sizes="100vw"
      />
      <div className="hero-upper-image-gradient absolute inset-0" />
    </div>
  );
}
