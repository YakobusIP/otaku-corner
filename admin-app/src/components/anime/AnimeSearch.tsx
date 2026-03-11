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
    <div className="flex flex-1 gap-3 max-w-md">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search anime..."
          value={query}
          onChange={handleChange}
          className="pl-9 h-9"
        />
      </div>
    </div>
  );
}
