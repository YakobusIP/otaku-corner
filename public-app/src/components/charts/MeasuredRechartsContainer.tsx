"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ChartSize = {
  width: number;
  height: number;
};

type MeasuredRechartsContainerProps = {
  className?: string;
  children: (size: ChartSize) => ReactNode;
};

export default function MeasuredRechartsContainer(
  props: MeasuredRechartsContainerProps
) {
  const { className, children } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ChartSize | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) {
        return;
      }
      setSize((previous) => {
        if (
          previous?.width === width &&
          previous?.height === height
        ) {
          return previous;
        }
        return { width, height };
      });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {size ? children(size) : null}
    </div>
  );
}
