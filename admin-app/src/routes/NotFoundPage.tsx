import { Button } from "@/components/ui/button";

import { HomeIcon, SearchIcon, SparklesIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-transparent px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-hidden sm:gap-5">
        <div className="w-full max-w-md rounded-2xl border border-border/40 bg-background/35 p-6 text-center shadow-sm backdrop-blur-sm sm:max-w-2xl sm:p-10">
          <img
            src="/not-found.webp"
            alt=""
            className="mx-auto w-56 max-w-full rounded-xl object-contain sm:w-64"
          />
          <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3">
            <SparklesIcon
              className="size-5 shrink-0 text-violet-400/90 sm:size-6"
              aria-hidden
            />
            <span className="text-5xl font-extrabold tracking-tight text-violet-300 sm:text-6xl tablet:text-7xl">
              404
            </span>
            <SparklesIcon
              className="size-5 shrink-0 scale-x-[-1] text-violet-400/90 sm:size-6"
              aria-hidden
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            Page not found
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved. It might have been removed, renamed, or is temporarily
            unavailable.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              className="h-11 rounded-xl bg-gradient-to-r from-[#7c6cf6] to-[#a855f7] px-6 text-white shadow-md hover:from-[#6f5ee8] hover:to-[#9333ea] hover:text-white"
            >
              <Link to="/" className="gap-2">
                <HomeIcon className="size-4 shrink-0" aria-hidden />
                Go back to homepage
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border/40 bg-background/35 p-4 shadow-sm backdrop-blur-sm sm:max-w-2xl sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-background/35 backdrop-blur-sm">
              <SearchIcon className="size-5 text-violet-300" aria-hidden />
            </div>
            <div className="min-w-0 text-left">
              <p className="font-semibold text-white">
                Can&apos;t find what you&apos;re looking for?
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/80">
                Try searching for something else or head back to the homepage.
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 shrink-0 rounded-xl border-violet-400/70 bg-transparent text-white hover:bg-violet-500/15 hover:text-white"
          >
            <Link to="/" className="gap-2">
              <HomeIcon className="size-4 shrink-0 text-violet-300" aria-hidden />
              Go to homepage
            </Link>
          </Button>
        </div>
      </div>

      <footer className="mt-auto shrink-0 py-4 text-center text-sm text-white/50 sm:py-5">
        &copy; {new Date().getFullYear()} bearking58 Otaku Corner
      </footer>
    </div>
  );
}
