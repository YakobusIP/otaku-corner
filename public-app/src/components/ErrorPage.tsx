"use client";

import GeneralFooter from "@/components/GeneralFooter";
import HeroWallpaper from "@/components/layout/HeroWallpaper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { ArrowLeftIcon, HomeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
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
                    src="/error.webp"
                    width={400}
                    height={400}
                    className="w-64"
                    alt="Error boundary"
                    priority
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                  Oops! Something Broke
                </h2>
                <p className="text-slate-700 text-lg font-medium">
                  We encountered an unexpected error
                </p>
                <p className="text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
                  Don&apos;t worry! Even the strongest anime heroes face
                  setbacks. We&apos;ll have this fixed faster than you can say
                  &apos;Kamehameha!&apos;
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
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
                What can you do?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <h4 className="font-medium text-slate-700 mb-2">
                    Quick Fixes:
                  </h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Refresh the page</li>
                    <li>• Clear your browser cache</li>
                  </ul>
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-slate-700 mb-2">
                    Still having issues?
                  </h4>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Check your internet connection</li>
                    <li>• Try again in a few minutes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <GeneralFooter />
    </HeroWallpaper>
  );
}
