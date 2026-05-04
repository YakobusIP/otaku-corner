import { Button } from "@/components/ui/button";

import { HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-transparent px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border/40 bg-background/35 p-8 text-center shadow-xs backdrop-blur-xs sm:max-w-2xl sm:p-10">
          <img
            src="/unauthorized.webp"
            alt=""
            className="mx-auto w-56 max-w-full rounded-xl object-contain sm:w-64"
          />
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-white">Unauthorized</span>{" "}
            <span className="text-violet-300">Access</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">
            Oops! It looks like you don&apos;t have permission to access this
            page. Please make sure you&apos;re logged in with the right account
            or have the required permissions.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              className="h-11 rounded-xl bg-linear-to-r from-[#7c6cf6] to-[#a855f7] px-6 text-white shadow-md hover:from-[#6f5ee8] hover:to-[#9333ea] hover:text-white"
            >
              <Link to="/" className="gap-2">
                <HomeIcon className="size-4 shrink-0" aria-hidden />
                Go back to homepage
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <footer className="mt-auto shrink-0 py-6 text-center text-sm text-white/50">
        &copy; {new Date().getFullYear()} bearking58 Otaku Corner
      </footer>
    </div>
  );
}
