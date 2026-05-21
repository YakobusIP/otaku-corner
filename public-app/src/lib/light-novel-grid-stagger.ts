const ROW_STAGGER_SECONDS = 0.1;
const COL_STAGGER_SECONDS = 0.06;

export const getLightNovelCardStaggerDelay = (
  index: number,
  columnCount: number
) => {
  const row = Math.floor(index / columnCount);
  const column = index % columnCount;
  return row * ROW_STAGGER_SECONDS + column * COL_STAGGER_SECONDS;
};
