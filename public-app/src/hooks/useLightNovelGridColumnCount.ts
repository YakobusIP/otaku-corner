"use client";

import { useEffect, useState } from "react";

const getColumnCountForWidth = (width: number) => {
  if (width >= 1280) return 5;
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  return 1;
};

export const useLightNovelGridColumnCount = () => {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const updateColumnCount = () => {
      setColumnCount(getColumnCountForWidth(window.innerWidth));
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  return columnCount;
};
