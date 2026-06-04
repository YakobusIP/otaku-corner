import { authorService } from "@/services/entity.service";

import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { AuthorEntity } from "@/types/entity.type";

import { entityFilterIncludeIds } from "@/lib/utils";

type Props = {
  selectedAuthor?: number;
  handleFilterAuthor: (key?: number) => void;
};

const PAGE_SIZE = 20;

export default function FilterAuthor({
  selectedAuthor,
  handleFilterAuthor
}: Props) {
  return (
    <FilterPopover<AuthorEntity, number>
      selectedKey={selectedAuthor}
      onChange={(key) => handleFilterAuthor(key)}
      infiniteQuery={{
        queryKey: (search) => ["authors", "filter-popover", search],
        pageSize: PAGE_SIZE,
        fetchPage: async (page, search, context) => {
          const result = await authorService.fetchAll<AuthorEntity>({
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
      getKey={(a) => a.id}
      getLabel={(a) => a.name}
      placeholder="Search author..."
      buttonFallbackLabel="Author"
      emptyText="No author found."
    />
  );
}
