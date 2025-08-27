"use client";

import { ChangeEvent, useContext, useEffect, useState } from "react";

import { AnimeContext } from "@/components/context/AnimeContext";
import { Input } from "@/components/ui/input";

import { SearchIcon } from "lucide-react";

type Props = {
  initialQuery?: string;
};

export default function AnimeSearch({ initialQuery }: Props) {
  const context = useContext(AnimeContext);
  if (!context) {
    throw new Error("Search must be used within an AnimeProvider");
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
    <div className="relative w-full sm:w-auto">
      <SearchIcon
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
        size={18}
      />
      <Input
        placeholder="Search anime..."
        value={query}
        onChange={handleChange}
        className="pl-10 w-full sm:w-64 bg-white/60 backdrop-blur-sm border-white/40 text-slate-800 placeholder:text-slate-600"
      />
    </div>
  );
}
