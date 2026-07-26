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

const DEFAULT_PAGE_SIZE = 10;
const FILTER_DEBOUNCE_MS = 300;

type UseImageVaultListPageOptions = {
  enabled?: boolean;
  pageSize?: number;
};

export const useImageVaultListPage = ({
  enabled = true,
  pageSize = DEFAULT_PAGE_SIZE
}: UseImageVaultListPageOptions = {}) => {
  const { state } = useImageVaultFilters();

  const [debouncedGroups] = useDebounce(state.groups, FILTER_DEBOUNCE_MS);

  const listFilters = useMemo((): ImageVaultInfiniteListFilters => {
    const groups = sanitizeFilterGroupsForRequest(debouncedGroups);
    return {
      limit: pageSize,
      groups: groups.length > 0 ? groups : undefined
    };
  }, [debouncedGroups, pageSize]);

  return useInfiniteQuery({
    queryKey: imageVaultKeys.infiniteList(listFilters),
    enabled,
    queryFn: async ({
      pageParam
    }): Promise<PaginatedListPage<ImageVaultEntry>> => {
      const requestFilters: ImageVaultListFilters = {
        ...listFilters,
        page: pageParam
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
