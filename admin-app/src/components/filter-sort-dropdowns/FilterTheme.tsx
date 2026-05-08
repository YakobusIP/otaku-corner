import { themeService } from "@/services/entity.service";
import { entityFilterIncludeIds } from "@/lib/utils";

import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { ThemeEntity } from "@/types/entity.type";

type Props = {
  selectedTheme?: number;
  handleFilterTheme: (key?: number) => void;
};

const PAGE_SIZE = 20;

export default function FilterTheme({
  selectedTheme,
  handleFilterTheme
}: Props) {
  return (
    <FilterPopover<ThemeEntity, number>
      selectedKey={selectedTheme}
      onChange={(key) => handleFilterTheme(key)}
      infiniteQuery={{
        queryKey: (search) => ["themes", "filter-popover", search],
        pageSize: PAGE_SIZE,
        fetchPage: async (page, search, context) => {
          const result = await themeService.fetchAll<ThemeEntity>({
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
      getKey={(t) => t.id}
      getLabel={(t) => t.name}
      placeholder="Search theme..."
      buttonFallbackLabel="Theme"
      emptyText="No theme found."
    />
  );
}
