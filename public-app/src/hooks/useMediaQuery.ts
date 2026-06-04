"use client";

import { useSyncExternalStore } from "react";

export const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

export const useMediaQuery = (query: string, fallback = false) => {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => fallback
  );
};
