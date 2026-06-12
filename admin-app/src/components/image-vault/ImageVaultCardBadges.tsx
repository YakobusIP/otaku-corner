import { useLayoutEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";

import type {
  ImageOriginType,
  ImageVaultCategory
} from "@/types/image-vault.type";

type Props = {
  originType: ImageOriginType;
  isExplicit: boolean;
  categories: ImageVaultCategory[];
};

function getMaxVisibleCategoryBadges(
  width: number,
  isExplicit: boolean,
  categoryCount: number
): number {
  const reservedBadges = isExplicit ? 2 : 1;
  const badgesPerRow = Math.max(1, Math.floor(width / 72));
  const totalSlots = badgesPerRow * 2;
  const slotsForMoreBadge = categoryCount > 0 ? 1 : 0;
  const availableForCategories = Math.max(
    0,
    totalSlots - reservedBadges - slotsForMoreBadge
  );

  return Math.min(categoryCount, availableForCategories);
}

export default function ImageVaultCardBadges({
  originType,
  isExplicit,
  categories
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => {
      setContainerWidth(element.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const maxVisibleCategories = getMaxVisibleCategoryBadges(
    containerWidth,
    isExplicit,
    categories.length
  );
  const visibleCategories = categories.slice(0, maxVisibleCategories);
  const hiddenCategoryCount = categories.length - visibleCategories.length;

  return (
    <div
      ref={containerRef}
      className="min-h-10 max-h-11 overflow-hidden"
    >
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className="shrink-0 text-[10px]">
          {originType}
        </Badge>
        {isExplicit ? (
          <Badge variant="destructive" className="shrink-0 text-[10px]">
            Explicit
          </Badge>
        ) : null}
        {visibleCategories.map((category) => (
          <Badge
            key={category.id}
            variant="secondary"
            className="max-w-full shrink truncate text-[10px]"
          >
            {category.name}
          </Badge>
        ))}
        {hiddenCategoryCount > 0 ? (
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            + {hiddenCategoryCount} more
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
