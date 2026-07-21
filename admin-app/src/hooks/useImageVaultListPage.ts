import { useMemo } from "react";

import { imageVaultService } from "@/services/image-vault.service";

import { useImageVaultFilters } from "@/components/context/ImageVaultFiltersContext";

import type { PaginatedListPage } from "@/types/general.type";
import type {
  ImageVaultEntry,
  ImageVaultInfiniteListFilters,
  ImageVaultListFilters
} from "@/types/image-vault.type";

import { sanitizeFilterGroupsForRequest } from "@/lib/image-vault-filter-expression";
import { imageVaultKeys } from "@/lib/query-keys";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

const PAGE_SIZE = 10;
const FILTER_DEBOUNCE_MS = 300;

export const useImageVaultListPage = () => {
  const { state } = useImageVaultFilters();

  const [debouncedGroups] = useDebounce(state.groups, FILTER_DEBOUNCE_MS);

  const listFilters = useMemo((): ImageVaultInfiniteListFilters => {
    const groups = sanitizeFilterGroupsForRequest(debouncedGroups);
    return {
      limit: PAGE_SIZE,
      groups: groups.length > 0 ? groups : undefined
    };
  }, [debouncedGroups]);

  return useInfiniteQuery({
    queryKey: imageVaultKeys.infiniteList(listFilters),
    queryFn: async ({
      pageParam
    }): Promise<PaginatedListPage<ImageVaultEntry>> => {
      const page = pageParam;
      const requestFilters: ImageVaultListFilters = {
        ...listFilters,
        page
      };
      const result = await imageVaultService.listImages(requestFilters);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pageCount } = lastPage.metadata;
      return page < pageCount ? page + 1 : undefined;
    }
  });
};

export type UseImageVaultListPageResult = ReturnType<
  typeof useImageVaultListPage
>;
