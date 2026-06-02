import { HERO_WALLPAPER_IMAGE_SIZES } from "@/lib/hero-wallpaper-image";
import { cn } from "@/lib/utils";

import Image from "next/image";

type HomeUpperSectionImageProps = {
  className?: string;
};

export default function HomeUpperSectionImage({
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
        priority
        className="object-cover object-[80%_center] md:object-center"
        sizes={HERO_WALLPAPER_IMAGE_SIZES}
      />
      <div className="hero-upper-image-gradient absolute inset-0" />
    </div>
  );
}
