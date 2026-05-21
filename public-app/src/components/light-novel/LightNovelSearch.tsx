"use client";

import { ChangeEvent, useContext, useEffect, useState } from "react";

import { LightNovelContext } from "@/components/context/LightNovelContext";
import { Input } from "@/components/ui/input";

import { SearchIcon } from "lucide-react";

type Props = {
  initialQuery?: string;
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
    <div className="relative min-w-0 w-full">
      <SearchIcon
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
        size={18}
      />
      <Input
        placeholder="Search light novel..."
        value={query}
        onChange={handleChange}
        className="pl-10 w-full bg-white/60 backdrop-blur-sm border-white/40 text-slate-800 placeholder:text-slate-600"
      />
    </div>
  );
}
