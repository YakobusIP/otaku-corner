import { studioService } from "@/services/entity.service";

import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { StudioEntity } from "@/types/entity.type";

type Props = {
  selectedStudio?: number;
  handleFilterStudio: (key?: number) => void;
};

export default function FilterStudio({
  selectedStudio,
  handleFilterStudio
}: Props) {
  return (
    <FilterPopover<StudioEntity, number>
      selectedKey={selectedStudio}
      onChange={(key) => handleFilterStudio(key)}
      query={{
        queryKey: ["studios"],
        queryFn: async () => {
          const r = await studioService.fetchAll<StudioEntity>();
          if (!r.success) throw new Error(r.error);
          return r.data;
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
