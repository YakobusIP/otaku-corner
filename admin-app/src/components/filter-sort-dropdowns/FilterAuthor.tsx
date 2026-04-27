import { authorService } from "@/services/entity.service";

import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { AuthorEntity } from "@/types/entity.type";

type Props = {
  selectedAuthor?: number;
  handleFilterAuthor: (key?: number) => void;
};

export default function FilterAuthor({
  selectedAuthor,
  handleFilterAuthor
}: Props) {
  return (
    <FilterPopover<AuthorEntity, number>
      selectedKey={selectedAuthor}
      onChange={(key) => handleFilterAuthor(key)}
      query={{
        queryKey: ["authors"],
        queryFn: async () => {
          const r = await authorService.fetchAll<AuthorEntity>();
          if (!r.success) throw new Error(r.error);
          return r.data;
        },
        refetchOnWindowFocus: false,
        staleTime: 24 * 60 * 60 * 1000
      }}
      getKey={(a) => a.id}
      getLabel={(a) => a.name}
      placeholder="Search author..."
      buttonFallbackLabel="Author"
      emptyText="No author found."
    />
  );
}
