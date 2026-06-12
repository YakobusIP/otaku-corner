"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

import { MOBILE_MEDIA_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";

import {
  PUBLIC_MEDIA_NAV_LINKS,
  PUBLIC_MEDIA_TYPE_CONFIG
} from "@/lib/media/public-media-type";
import { cn } from "@/lib/shared/utils";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  HomeIcon,
  LibraryIcon,
  MenuIcon,
  PlayIcon,
  type LucideIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const homeCardSurfaceClassName =
  "border-white/75 bg-white/70 shadow-[0_14px_36px_rgba(244,114,182,0.16)] backdrop-blur-md";

const navLinks = [
  { href: "/", label: "Home" },
  ...PUBLIC_MEDIA_NAV_LINKS
] as const;

const mobileNavIcons: Record<
  (typeof navLinks)[number]["href"],
  { Icon: LucideIcon; iconBg: string }
> = {
  "/": { Icon: HomeIcon, iconBg: "bg-violet-100 text-violet-600" },
  [PUBLIC_MEDIA_TYPE_CONFIG.anime.listHref]: {
    Icon: PlayIcon,
    iconBg: PUBLIC_MEDIA_TYPE_CONFIG.anime.heroCounterIconBg
  },
  [PUBLIC_MEDIA_TYPE_CONFIG.manga.listHref]: {
    Icon: BookOpenIcon,
    iconBg: PUBLIC_MEDIA_TYPE_CONFIG.manga.heroCounterIconBg
  },
  [PUBLIC_MEDIA_TYPE_CONFIG.lightNovel.listHref]: {
    Icon: LibraryIcon,
    iconBg: PUBLIC_MEDIA_TYPE_CONFIG.lightNovel.heroCounterIconBg
  }
};

type HomePublicNavbarProps = {
  className?: string;
};

const navEntranceTransition = {
  duration: 0.9,
  ease: [0.22, 1, 0.36, 1] as const
};

const navViewport = {
  once: true,
  amount: 0.05,
  margin: "0px 0px 12% 0px"
} as const;

const isNavLinkActive = (href: string, pathname: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

export default function HomePublicNavbar(props: HomePublicNavbarProps) {
  const { className } = props;
  const pathname = usePathname();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);
  const [menuOpen, setMenuOpen] = useState(false);

  const showMobileBack = pathname !== "/";

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const headerClassName = cn("relative z-30", className);

  const navbarContent = (
    <div className="mx-auto box-border flex w-full max-w-[1400px] flex-col gap-4 px-4 py-5 md:grid md:grid-cols-[auto_1fr_auto] md:items-center sm:px-8 lg:px-12">
      <div className="relative flex w-full items-center md:contents">
        <div
          className={cn(
            "z-10 flex justify-start md:contents",
            showMobileBack && "min-w-0 flex-1"
          )}
        >
          {showMobileBack ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="shrink-0 text-[#2f1830] hover:bg-white/40 md:hidden"
            >
              <ArrowLeftIcon size={16} />
              Back
            </Button>
          ) : null}
        </div>

        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 text-lg font-semibold tracking-tight text-[#2f1830]",
            isMobile &&
              showMobileBack &&
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            isMobile && !showMobileBack && "relative z-10 shrink-0",
            "md:static md:translate-x-0 md:translate-y-0"
          )}
        >
          <Image
            src="/otaku-corner-logo.webp"
            alt="Website Logo"
            width={40}
            height={40}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="whitespace-nowrap">Otaku Corner</span>
        </Link>

        <div className="z-10 ml-auto flex shrink-0 justify-end md:contents">
          {isMobile ? (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                  className="text-[#2f1830] hover:bg-white/40"
                >
                  <MenuIcon size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className={cn("border", homeCardSurfaceClassName)}
              >
                <SheetTitle className="text-left text-[#2f1830]">
                  Navigation
                </SheetTitle>
                <nav className="mt-8 flex flex-col gap-1">
                  {navLinks.map((item) => {
                    const isActive = isNavLinkActive(item.href, pathname);
                    const { Icon, iconBg } = mobileNavIcons[item.href];

                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold transition-colors",
                            isActive
                              ? "bg-white/80 text-rose-600 shadow-sm"
                              : "text-[#2f1830] hover:bg-white/60 hover:text-rose-600"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              iconBg
                            )}
                          >
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>
      </div>

      <nav className="hidden w-full flex-wrap items-center justify-center md:flex">
        <div className="inline-flex max-w-full flex-wrap items-stretch justify-center gap-2 overflow-hidden rounded-xl border border-white/45 bg-white/35 shadow-sm backdrop-blur-md">
          {navLinks.map((item, index) => {
            const isActive = isNavLinkActive(item.href, pathname);
            const isFirst = index === 0;
            const isLast = index === navLinks.length - 1;
            const activeRadius = isActive
              ? isFirst
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
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div aria-hidden className="hidden w-[150px] md:block" />
    </div>
  );

  if (prefersReducedMotion) {
    return <header className={headerClassName}>{navbarContent}</header>;
  }

  return (
    <motion.header
      className={headerClassName}
      initial={{ opacity: 0, y: -22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={navViewport}
      transition={navEntranceTransition}
    >
      {navbarContent}
    </motion.header>
  );
}
