"use client";

import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/anime", label: "Anime" },
  { href: "/manga", label: "Manga" },
  { href: "/light-novel", label: "Light Novels" }
] as const;

type HomePublicNavbarProps = {
  className?: string;
};

export default function HomePublicNavbar(props: HomePublicNavbarProps) {
  const { className } = props;
  const pathname = usePathname();

  return (
    <header className={cn("relative z-30", className)}>
      <div className="mx-auto box-border flex w-full max-w-[1400px] flex-col gap-4 px-4 py-5 sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-[#2f1830]"
        >
          <Image
            src="/otaku-corner-logo.webp"
            alt="Otaku Corner"
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
            priority
          />
          <span>Otaku Corner</span>
        </Link>
        <nav className="flex w-full flex-wrap items-center justify-center gap-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold shadow-sm backdrop-blur-md transition-colors sm:px-4 sm:text-sm",
                  isActive
                    ? "border-white/80 bg-white/80 text-rose-600"
                    : "border-white/45 bg-white/35 text-[#2f1830] hover:bg-white/60 hover:text-rose-600"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div aria-hidden className="hidden w-[150px] sm:block" />
      </div>
    </header>
  );
}
