"use client";

import { BaseSyntheticEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  fallbackHref: string;
};

export default function BackToListButton({ fallbackHref }: Props) {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    setHasHistory(window.history.length > 2);
  }, []);

  const handleClick = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    console.log(hasHistory);
    if (hasHistory) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button onClick={handleClick}>
      <ArrowLeftIcon className="w-4 h-4" />
      Back
    </Button>
  );
}
