import { useMemo } from "react";

import { imageVaultService } from "@/services/image-vault.service";

import { useImageVaultFilters } from "@/components/context/ImageVaultFiltersContext";

import type { PaginatedListPage } from "@/types/general.type";
import type {
  ImageVaultInfiniteListFilters,
  ImageVaultListFilters
} from "@/types/image-vault.type";
import type { ImageVaultEntry } from "@/types/image-vault.type";

import { imageVaultKeys } from "@/lib/query-keys";

import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;

export const useImageVaultListPage = (enabled = true) => {
  const { state } = useImageVaultFilters();

  const listFilters = useMemo((): ImageVaultInfiniteListFilters => {
    return {
      limit: PAGE_SIZE,
      search: state.search || undefined,
      originType: state.originType === "all" ? undefined : state.originType,
      modelId: state.modelId || undefined,
      categoryId: state.categoryId || undefined,
      isExplicit: state.explicitOnly ? true : undefined
    };
  }, [
    state.search,
    state.originType,
    state.modelId,
    state.categoryId,
    state.explicitOnly
  ]);

  return useInfiniteQuery({
    queryKey: imageVaultKeys.infiniteList(listFilters),
    enabled,
    queryFn: async ({
      pageParam
    }): Promise<PaginatedListPage<ImageVaultEntry>> => {
      const page = pageParam as number;
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
