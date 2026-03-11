import { genreService } from "@/services/entity.service";

import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { GenreEntity } from "@/types/entity.type";

type Props = {
  selectedGenre?: number;
  handleFilterGenre: (key?: number) => void;
};

export default function FilterGenre({
  selectedGenre,
  handleFilterGenre
}: Props) {
  return (
    <FilterPopover<GenreEntity, number>
      selectedKey={selectedGenre}
      onChange={(key) => handleFilterGenre(key)}
      query={{
        queryKey: ["genres"],
        queryFn: genreService.fetchAll<GenreEntity[]>,
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
