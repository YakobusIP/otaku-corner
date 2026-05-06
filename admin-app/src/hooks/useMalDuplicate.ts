import { useEffect, useState } from "react";

import { animeService } from "@/services/anime.service";

export const useMalDuplicate = (malId: number) => {
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    animeService.getDuplicates(malId).then((response) => {
      if (cancelled) return;
      if (response.success) setExists(response.data.exists);
      else setExists(null);
    });
    return () => {
      cancelled = true;
    };
  }, [malId]);

  return exists;
};
