"use client";

import GeneralFooter from "@/components/GeneralFooter";
import HeroWallpaper from "@/components/layout/HeroWallpaper";
import { Card, CardContent } from "@/components/ui/card";

import { useLoadingDots } from "@/hooks/useLoadingDots";

import Image from "next/image";

export default function LoadingPage() {
  const loadingDots = useLoadingDots();

  return (
    <HeroWallpaper>
      <div className="container mx-auto flex flex-1 flex-col py-8">
        <section className="mb-8 flex flex-1 items-center justify-center py-8">
          <Card className="bg-white backdrop-blur-xl border border-white shadow-2xl max-w-md w-full h-fit">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-fit mx-auto mb-4 rounded-xl overflow-hidden bg-white backdrop-blur-sm border border-white flex items-center justify-center">
                  <Image
                    src="/loading.webp"
                    width={400}
                    height={400}
                    className="w-64"
                    alt="Loading"
                    priority
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-800">
                  Loading
                  <span className="inline-block w-8 text-left">
                    {loadingDots}
                  </span>
                </h2>
                <p className="text-slate-600 text-sm">
                  Pulling the data from another dimension...
                </p>
                <p className="text-xs text-slate-500 mt-2">Just a moment</p>
              </div>

              <div className="mt-8 flex justify-center space-x-2">
                <div
                  className="w-2 h-2 bg-rose-200 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-rose-300 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <GeneralFooter />
    </HeroWallpaper>
  );
}
