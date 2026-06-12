import { ReactNode } from "react";

type HeroWallpaperProps = {
  children: ReactNode;
};

export default function HeroWallpaper({ children }: HeroWallpaperProps) {
  return (
    <div className="hero-wallpaper flex min-h-dvh flex-col text-slate-900">
      <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}
