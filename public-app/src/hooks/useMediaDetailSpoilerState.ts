"use client";

import { useCallback, useState } from "react";

export const useMediaDetailSpoilerState = () => {
  const [showSpoilerWarning, setShowSpoilerWarning] = useState(false);
  const [spoilersRevealed, setSpoilersRevealed] = useState(false);

  const handleRevealSpoilers = useCallback(() => setShowSpoilerWarning(true), []);

  return {
    showSpoilerWarning,
    setShowSpoilerWarning,
    spoilersRevealed,
    setSpoilersRevealed,
    handleRevealSpoilers
  };
};
