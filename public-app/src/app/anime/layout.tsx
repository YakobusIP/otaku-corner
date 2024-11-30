"use client";

import { ReactNode } from "react";

import { AnimeProvider } from "@/components/context/AnimeContext";

type Props = {
  children: ReactNode;
};

export default function AnimeListLayout({ children }: Props) {
  return <AnimeProvider>{children}</AnimeProvider>;
}
