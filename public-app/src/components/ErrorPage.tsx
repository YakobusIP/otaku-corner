"use client";

import GeneralFooter from "@/components/GeneralFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { AlertTriangleIcon, ArrowLeftIcon, HomeIcon } from "lucide-react";
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
    <html>
      <head>
        <title>Unexpected Error | Otaku Corner</title>
      </head>
      <body>
        <div className="min-h-screen bg-gradient-to-r from-[#ffafbd] via-[#ffc3a0] to-[#ffeecf] flex items-center justify-center p-8">
          <div className="text-center space-y-8 max-w-2xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl">
              <CardContent className="p-12">
                <div className="mb-8 w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangleIcon className="w-10 h-10 text-red-600" />
                </div>

                <div className="mb-8">
                  <div className="w-40 h-40 mx-auto mb-6 rounded-xl overflow-hidden bg-white/60 backdrop-blur-sm border border-white/40 flex items-center justify-center">
                    <Image
                      src="/error.gif"
                      width={256}
                      height={256}
                      className="w-full h-full object-cover"
                      alt="Error boundary"
                      unoptimized
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h2 className="text-slate-800 text-2xl md:text-3xl font-bold">
                    Oops! Something Broke
                  </h2>
                  <p className="text-lg text-slate-700 font-medium">
                    We encountered an unexpected error
                  </p>
                  <p className="text-slate-600 leading-relaxed max-w-lg mx-auto">
                    Don&apos;t worry! Even the strongest anime heroes face
                    setbacks. We&apos;ll have this fixed faster than you can say
                    &apos;Kamehameha!&apos;
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

            <GeneralFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
