"use client";

import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
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
        <nav className="hidden w-full flex-wrap items-center justify-center sm:flex">
          <div className="inline-flex max-w-full flex-wrap items-stretch justify-center gap-2 overflow-hidden rounded-xl border border-white/45 bg-white/35 shadow-sm backdrop-blur-md">
            {navLinks.map((item, index) => {
              const isActive = pathname === item.href;
              const isFirst = index === 0;
              const isLast = index === navLinks.length - 1;
              const activeRadius = isActive
                ? isFirst && isLast
                  ? "rounded-xl"
                  : isFirst
                    ? "rounded-r-xl"
                    : isLast
                      ? "rounded-l-xl"
                      : "rounded-xl"
                : "rounded-xl";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-10 min-h-10 shrink-0 items-center justify-center px-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
                    activeRadius,
                    isActive
                      ? "bg-white/80 text-rose-600 shadow-sm"
                      : "text-[#2f1830] hover:bg-white/60 hover:text-rose-600"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div aria-hidden className="hidden w-[150px] sm:block" />
      </div>
    </header>
  );
}
