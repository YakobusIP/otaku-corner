import { useEffect, useState } from "react";

export const useLoadingDots = (enabled = true) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!enabled) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, [enabled]);

  return dots;
};
