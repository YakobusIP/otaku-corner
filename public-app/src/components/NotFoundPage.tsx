"use client";

import GeneralFooter from "@/components/GeneralFooter";
import HeroWallpaper from "@/components/layout/HeroWallpaper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  ArrowLeftIcon,
  BookIcon,
  HomeIcon,
  LibraryIcon,
  PlayIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <HeroWallpaper>
      <div className="container mx-auto flex flex-1 flex-col py-8">
        <section className="mb-8 flex flex-1 flex-col items-center justify-center gap-8 py-8">
          <Card className="bg-white backdrop-blur-xl border border-white shadow-2xl max-w-md w-full h-fit">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-fit mx-auto mb-4 rounded-xl overflow-hidden bg-white backdrop-blur-sm border border-white flex items-center justify-center">
                  <Image
                    src="/no-result.webp"
                    width={400}
                    height={400}
                    className="w-64"
                    alt="Page not found"
                    priority
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                  Not Found
                </h2>
                <p className="text-slate-700 text-lg font-medium">
                  Looks like this page went on a quest
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Don&apos;t worry, even the best adventurers sometimes take
                  wrong turns!
                </p>
              </div>

              <div className="mt-8 flex gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-rose-400 text-white hover:bg-rose-500">
                    <HomeIcon />
                    Go home
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white"
                  onClick={handleBack}
                >
                  <ArrowLeftIcon />
                  Go back
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white backdrop-blur-xl border border-white shadow-2xl max-w-2xl w-full h-fit">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Maybe you&apos;re looking for:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <Link href="/anime">
                  <Button
                    variant="ghost"
                    className="text-slate-700 hover:bg-rose-100 hover:text-rose-600"
                  >
                    <PlayIcon size={20} />
                    Anime List
                  </Button>
                </Link>
                <Link href="/manga">
                  <Button
                    variant="ghost"
                    className="text-slate-700 hover:bg-rose-100 hover:text-rose-600"
                  >
                    <BookIcon size={20} />
                    Manga List
                  </Button>
                </Link>
                <Link href="/light-novel">
                  <Button
                    variant="ghost"
                    className="text-slate-700 hover:bg-rose-100 hover:text-rose-600"
                  >
                    <LibraryIcon size={20} />
                    Light Novel List
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <GeneralFooter />
    </HeroWallpaper>
  );
}
