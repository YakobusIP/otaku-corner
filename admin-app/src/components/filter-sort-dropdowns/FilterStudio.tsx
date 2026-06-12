import { studioService } from "@/services/entity.service";

import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { StudioEntity } from "@/types/entity.type";

import { entityFilterIncludeIds } from "@/lib/utils";

type Props = {
  selectedStudio?: number;
  handleFilterStudio: (key?: number) => void;
};

const PAGE_SIZE = 20;

export default function FilterStudio({
  selectedStudio,
  handleFilterStudio
}: Props) {
  return (
    <FilterPopover<StudioEntity, number>
      selectedKey={selectedStudio}
      onChange={(key) => handleFilterStudio(key)}
      infiniteQuery={{
        queryKey: (search) => ["studios", "filter-popover", search],
        pageSize: PAGE_SIZE,
        fetchPage: async (page, search, context) => {
          const result = await studioService.fetchAll<StudioEntity>({
            page,
            limit: PAGE_SIZE,
            query: search || undefined,
            includeIds: entityFilterIncludeIds(context)
          });
          if (!result.success) throw new Error(result.error);
          return result.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 24 * 60 * 60 * 1000
      }}
      getKey={(s) => s.id}
      getLabel={(s) => s.name}
      placeholder="Search studio..."
      buttonFallbackLabel="Studio"
      emptyText="No studio found."
    />
  );
}
