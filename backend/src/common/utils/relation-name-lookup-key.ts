export const relationNameLookupKey = (name: string): string =>
  name.trim().toLowerCase();

export const indexByRelationNameLookupKey = <T extends { name: string }>(
  rows: T[]
): Map<string, T> => {
  const map = new Map<string, T>();
  for (const row of rows) {
    map.set(relationNameLookupKey(row.name), row);
  }
  return map;
};
