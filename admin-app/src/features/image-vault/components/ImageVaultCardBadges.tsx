import { Fragment, useLayoutEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";

import type {
  ImageOriginType,
  ImageVaultCategory,
  ImageVaultSafetyLevel
} from "@/types/image-vault.type";

const ESTIMATED_BADGE_WIDTH_PX = 72;

const ORIGIN_BADGE_STYLES: Record<ImageOriginType, string> = {
  AI: "border-orange-500/30 bg-orange-500/15 text-orange-700 dark:text-orange-300",
  HUMAN:
    "border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-300"
};

type BadgeContentProps = {
  originType: ImageOriginType;
  safetyLevel: ImageVaultSafetyLevel;
  categories: ImageVaultCategory[];
  isFollowUp: boolean;
  modelName?: string | null;
  compact: boolean;
  visibleCategories: ImageVaultCategory[];
  hiddenCategoryCount: number;
};

function ImageVaultEntryBadgeContent({
  originType,
  safetyLevel,
  categories,
  isFollowUp,
  modelName,
  compact,
  visibleCategories,
  hiddenCategoryCount
}: BadgeContentProps) {
  const sizeClass = compact ? "shrink-0 text-[10px]" : undefined;
  const categoryClass = compact
    ? "max-w-full shrink truncate text-[10px]"
    : undefined;

  return (
    <Fragment>
      <Badge
        variant="outline"
        className={
          compact
            ? `shrink-0 text-[10px] ${ORIGIN_BADGE_STYLES[originType]}`
            : ORIGIN_BADGE_STYLES[originType]
        }
      >
        {originType}
      </Badge>
      {isFollowUp ? (
        <Badge variant="outline" className={sizeClass}>
          Follow-up
        </Badge>
      ) : null}
      {modelName ? (
        <Badge variant="secondary" className={sizeClass}>
          {modelName}
        </Badge>
      ) : null}
      {safetyLevel === "SAFE" ? (
        <Badge
          variant="secondary"
          className={
            compact
              ? "shrink-0 bg-emerald-500/15 text-[10px] text-emerald-700 dark:text-emerald-300"
              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          }
        >
          Safe
        </Badge>
      ) : null}
      {safetyLevel === "NSFW" ? (
        <Badge
          variant="secondary"
          className={
            compact
              ? "shrink-0 bg-amber-500/15 text-[10px] text-amber-700 dark:text-amber-300"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
          }
        >
          NSFW
        </Badge>
      ) : null}
      {safetyLevel === "EXPLICIT" ? (
        <Badge variant="destructive" className={sizeClass}>
          Explicit
        </Badge>
      ) : null}
      {(compact ? visibleCategories : categories).map((category) => (
        <Badge key={category.id} variant="secondary" className={categoryClass}>
          {category.name}
        </Badge>
      ))}
      {compact && hiddenCategoryCount > 0 ? (
        <Badge variant="secondary" className={sizeClass}>
          + {hiddenCategoryCount} more
        </Badge>
      ) : null}
    </Fragment>
  );
}

function countReservedBadges(
  isFollowUp: boolean,
  safetyLevel: ImageVaultSafetyLevel,
  hasModel: boolean
): number {
  let count = 1;
  if (isFollowUp) count += 1;
  if (hasModel) count += 1;
  if (safetyLevel) count += 1;
  return count;
}

function getMaxVisibleCategoryBadges(
  width: number,
  reservedBadges: number,
  categoryCount: number
): number {
  const badgesPerRow = Math.max(
    1,
    Math.floor(width / ESTIMATED_BADGE_WIDTH_PX)
  );
  const totalSlots = badgesPerRow * 2;
  const slotsForMoreBadge = categoryCount > 0 ? 1 : 0;
  const availableForCategories = Math.max(
    0,
    totalSlots - reservedBadges - slotsForMoreBadge
  );

  return Math.min(categoryCount, availableForCategories);
}

type Props = {
  originType: ImageOriginType;
  safetyLevel: ImageVaultSafetyLevel;
  categories: ImageVaultCategory[];
  isFollowUp?: boolean;
  modelName?: string | null;
  variant?: "card" | "detail";
};

export default function ImageVaultCardBadges({
  originType,
  safetyLevel,
  categories,
  isFollowUp = false,
  modelName = null,
  variant = "card"
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const compact = variant === "card";

  useLayoutEffect(() => {
    if (!compact) return;

    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => {
      setContainerWidth(element.clientWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, [compact]);

  const reservedBadges = countReservedBadges(
    isFollowUp,
    safetyLevel,
    Boolean(modelName)
  );
  const maxVisibleCategories = getMaxVisibleCategoryBadges(
    containerWidth,
    reservedBadges,
    categories.length
  );
  const visibleCategories = categories.slice(0, maxVisibleCategories);
  const hiddenCategoryCount = categories.length - visibleCategories.length;

  const badgeContent = (
    <ImageVaultEntryBadgeContent
      originType={originType}
      safetyLevel={safetyLevel}
      categories={categories}
      isFollowUp={isFollowUp}
      modelName={modelName}
      compact={compact}
      visibleCategories={visibleCategories}
      hiddenCategoryCount={hiddenCategoryCount}
    />
  );

  if (!compact) {
    return <div className="flex flex-wrap gap-2">{badgeContent}</div>;
  }

  return (
    <div ref={containerRef} className="min-h-10 max-h-11 overflow-hidden">
      <div className="flex flex-wrap gap-1">{badgeContent}</div>
    </div>
  );
}
