import { genreService } from "@/services/entity.service";

import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { GenreEntity } from "@/types/entity.type";

import { entityFilterIncludeIds } from "@/lib/utils";

type Props = {
  selectedGenre?: number;
  handleFilterGenre: (key?: number) => void;
};

const PAGE_SIZE = 20;

export default function FilterGenre({
  selectedGenre,
  handleFilterGenre
}: Props) {
  return (
    <FilterPopover<GenreEntity, number>
      selectedKey={selectedGenre}
      onChange={(key) => handleFilterGenre(key)}
      infiniteQuery={{
        queryKey: (search) => ["genres", "filter-popover", search],
        pageSize: PAGE_SIZE,
        fetchPage: async (page, search, context) => {
          const result = await genreService.fetchAll<GenreEntity>({
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
      getKey={(g) => g.id}
      getLabel={(g) => g.name}
      placeholder="Search genre..."
      buttonFallbackLabel="Genre"
      emptyText="No genre found."
    />
  );
}
