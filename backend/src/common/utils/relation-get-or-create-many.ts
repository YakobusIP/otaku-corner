import {
  indexByRelationNameLookupKey,
  relationNameLookupKey
} from "@/common/utils/relation-name-lookup-key";

export type NameIdRow = { id: number; name: string };

export type NameRowWriteDelegate = {
  findMany(args: { where: { name: { in: string[] } } }): Promise<NameIdRow[]>;
  createMany(args: {
    data: { name: string }[];
    skipDuplicates?: boolean;
  }): Promise<unknown>;
};

export const getOrCreateManyNameRows = async (
  delegate: NameRowWriteDelegate,
  names: string[]
): Promise<NameIdRow[]> => {
  const trimmed = names.map((n) => n.trim()).filter((n) => n.length > 0);
  if (trimmed.length === 0) {
    return [];
  }

  const canonicalByKey = new Map<string, string>();
  for (const name of trimmed) {
    const key = relationNameLookupKey(name);
    if (!canonicalByKey.has(key)) {
      canonicalByKey.set(key, name);
    }
  }

  const uniqueCanonicals = [...new Set(canonicalByKey.values())];

  let rows = await delegate.findMany({
    where: { name: { in: uniqueCanonicals } }
  });
  let byKey = indexByRelationNameLookupKey(rows);

  const toCreate = [...canonicalByKey.entries()]
    .filter(([key]) => !byKey.has(key))
    .map(([, canonical]) => canonical);

  if (toCreate.length > 0) {
    await delegate.createMany({
      data: toCreate.map((name) => ({ name })),
      skipDuplicates: true
    });
    rows = await delegate.findMany({
      where: { name: { in: uniqueCanonicals } }
    });
    byKey = indexByRelationNameLookupKey(rows);
  }

  return [...byKey.values()];
};
