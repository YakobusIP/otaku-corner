"use client";

import { ChangeEventHandler } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { MEDIA_TYPE } from "@/lib/enums";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  type: MEDIA_TYPE;
  searchMedia: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export default function ListHeader({ type, searchMedia, onChange }: Props) {
  return (
    <header className="bg-primary text-primary-foreground py-8 px-4 md:px-6">
      <Link href="/">
        <Button
          variant="outline"
          className="absolute text-primary top-4 left-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Home
        </Button>
      </Link>
      <div className="container pt-12 xl:pt-0">
        <div className="flex flex-col gap-4 text-center xl:text-left">
          <h1 className="max-w-[650px]">{type} Watchlist</h1>
          <h4 className="text-primary-foreground/80 max-w-[650px]">
            Discover my consumed {type.toLowerCase()}s
          </h4>
          <div className="mt-6">
            <Input
              type="text"
              placeholder={`Search for ${type.toLowerCase()}...`}
              value={searchMedia}
              className="w-full max-w-md bg-primary-foreground/10 border-none focus:ring-0 focus:border-none"
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
