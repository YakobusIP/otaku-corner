import { BadRequestException } from "@nestjs/common";

import { relationNameLookupKey } from "@/common/utils/relation-name-lookup-key";

export const buildRelationIdLookupMap = (
  rows: { id: number; name: string }[]
): Map<string, number> =>
  new Map(rows.map((row) => [relationNameLookupKey(row.name), row.id]));

export const requireRelationIdFromMap = (
  map: Map<string, number>,
  rawName: string,
  entityLabel: string
): number => {
  const id = map.get(relationNameLookupKey(rawName));
  if (id === undefined) {
    throw new BadRequestException(
      `${entityLabel} could not be resolved for name: ${JSON.stringify(rawName)}`
    );
  }
  return id;
};
