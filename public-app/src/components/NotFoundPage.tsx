"use client";

import GeneralFooter from "@/components/GeneralFooter";
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
    <div className="min-h-screen bg-gradient-to-r from-[#ffafbd] via-[#ffc3a0] to-[#ffeecf] overflow-hidden">
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl">
            <CardContent className="p-12">
              <h1 className="text-8xl md:text-9xl font-bold text-slate-800/20 leading-none mb-8">
                404
              </h1>

              <div className="mb-8">
                <div className="w-40 h-40 mx-auto mb-6 rounded-xl overflow-hidden bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                  <Image
                    src="/not-found.gif"
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                    alt="Not found error"
                    unoptimized
                  />
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h2 className="text-slate-800 text-2xl md:text-3xl font-bold">
                  Page Not Found
                </h2>
                <p className="text-lg text-slate-700 font-medium">
                  Looks like this page went on a quest
                </p>
                <p className="text-slate-600 leading-relaxed max-w-lg mx-auto">
                  Don&apos;t worry, even the best adventurers sometimes take
                  wrong turns!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-slate-800 hover:bg-slate-700 text-white">
                    <HomeIcon size={16} />
                    Go home
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 bg-transparent"
                  onClick={handleBack}
                >
                  <ArrowLeftIcon size={16} />
                  Go back
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Maybe you&apos;re looking for:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <Link href="/anime">
                  <Button
                    variant="ghost"
                    className="hover:bg-white/60 hover:text-slate-900 text-slate-700"
                  >
                    <PlayIcon size={20} />
                    Anime List
                  </Button>
                </Link>
                <Link href="/manga">
                  <Button
                    variant="ghost"
                    className="hover:bg-white/60 hover:text-slate-900 text-slate-700"
                  >
                    <BookIcon size={20} />
                    Manga List
                  </Button>
                </Link>
                <Link href="/light-novel">
                  <Button
                    variant="ghost"
                    className="hover:bg-white/60 hover:text-slate-900 text-slate-700"
                  >
                    <LibraryIcon size={20} />
                    Light Novel List
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <GeneralFooter />
        </div>
      </div>
    </div>
  );
}
