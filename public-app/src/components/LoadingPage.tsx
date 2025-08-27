"use client";

import { useEffect, useState } from "react";

import GeneralFooter from "@/components/GeneralFooter";

import Image from "next/image";

export default function LoadingPage() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-[#ffafbd] via-[#ffc3a0] to-[#ffeecf] items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-12 max-w-md mx-auto">
          <div className="flex justify-center mb-8">
            <Image
              src="/loading.gif"
              alt="Loading data"
              width={220}
              height={124}
              className="rounded-xl"
              unoptimized
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-800">
              Loading<span className="inline-block w-8 text-left">{dots}</span>
            </h1>

            <p className="text-slate-600 text-sm leading-relaxed">
              Please wait while we fetch your content...
            </p>
          </div>

          <div className="mt-8 flex justify-center space-x-2">
            <div
              className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>

        <GeneralFooter />
      </div>
    </div>
  );
}
