export const appendFilesUpToLimit = (
  previous: File[],
  selected: File[],
  maxCount: number
): File[] => {
  const remainingSlots = maxCount - previous.length;
  if (remainingSlots <= 0 || selected.length === 0) return previous;
  return [...previous, ...selected.slice(0, remainingSlots)];
};
