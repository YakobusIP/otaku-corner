"use client";

import { ChangeEvent, useContext, useEffect, useState } from "react";

import ListHeader from "@/components/ListHeader";
import { LightNovelContext } from "@/components/context/LightNovelContext";

import { MEDIA_TYPE } from "@/lib/enums";

type Props = {
  initialQuery: string;
};

export default function LightNovelSearch({ initialQuery }: Props) {
  const context = useContext(LightNovelContext);
  if (!context) {
    throw new Error("Search must be used within an LightNovelProvider");
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
      type={MEDIA_TYPE.LIGHT_NOVEL}
      searchMedia={query}
      onChange={handleChange}
    />
  );
}
