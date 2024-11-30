"use client";

import { ChangeEvent, useContext, useEffect, useState } from "react";

import ListHeader from "@/components/ListHeader";
import { MangaContext } from "@/components/context/MangaContext";

import { MEDIA_TYPE } from "@/lib/enums";

type Props = {
  initialQuery: string;
};

export default function MangaSearch({ initialQuery }: Props) {
  const context = useContext(MangaContext);
  if (!context) {
    throw new Error("Search must be used within an MangaProvider");
  }

  const { state, setQuery } = context;
  const [query, setLocalQuery] = useState(initialQuery);

  useEffect(() => {
    setLocalQuery(state.query);
  }, [state.query]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
    setQuery(e.target.value);
  };

  return (
    <ListHeader
      type={MEDIA_TYPE.MANGA}
      searchMedia={query}
      onChange={handleChange}
    />
  );
}
