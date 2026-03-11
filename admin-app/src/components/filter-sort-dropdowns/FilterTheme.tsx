import { themeService } from "@/services/entity.service";

import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { ThemeEntity } from "@/types/entity.type";

type Props = {
  selectedTheme?: number;
  handleFilterTheme: (key?: number) => void;
};

export default function FilterTheme({
  selectedTheme,
  handleFilterTheme
}: Props) {
  return (
    <FilterPopover<ThemeEntity, number>
      selectedKey={selectedTheme}
      onChange={(key) => handleFilterTheme(key)}
      query={{
        queryKey: ["themes"],
        queryFn: themeService.fetchAll<ThemeEntity[]>,
        refetchOnWindowFocus: false,
        staleTime: 24 * 60 * 60 * 1000
      }}
      getKey={(t) => t.id}
      getLabel={(t) => t.name}
      placeholder="Search theme..."
      buttonFallbackLabel="Theme"
      emptyText="No theme found."
    />
  );
}
