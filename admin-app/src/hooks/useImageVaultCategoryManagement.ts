import { useEffect, useMemo, useState } from "react";

import {
  useImageVaultCategories,
  useImageVaultMutations
} from "@/hooks/useImageVaultQueries";

import type {
  ImageVaultCatalogEditDialogControl,
  ImageVaultCategory
} from "@/types/image-vault.type";

import type { RowSelectionState } from "@tanstack/react-table";
import { useDebounce } from "use-debounce";

const PAGE_SIZE = 10;

export type EditCategoryPayload = {
  id: string;
  name: string;
  slug: string;
};

export function useImageVaultCategoryManagement(enabled: boolean) {
  const { data: allCategories = [], isFetching: isLoadingList } =
    useImageVaultCategories(enabled);
  const { createCategory, updateCategory, deleteCategories } =
    useImageVaultMutations();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return allCategories;

    return allCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
    );
  }, [allCategories, debouncedSearch]);

  const metadata = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      pageCount: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
      itemCount: filtered.length
    }),
    [filtered.length, page]
  );

  const list = useMemo((): ImageVaultCategory[] => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const editDialogControl = useMemo<ImageVaultCatalogEditDialogControl>(
    () => ({
      isOpenFor: (id) => editingEntityId === id,
      onOpenChange: (id, open) => {
        if (open) setEditingEntityId(id);
        else setEditingEntityId((current) => (current === id ? null : current));
      }
    }),
    [editingEntityId]
  );

  const addCategory = (payload: { name: string; slug: string }) => {
    createCategory.mutate(payload, {
      onSuccess: () => setIsOpenAdd(false)
    });
  };

  const editCategory = (payload: EditCategoryPayload) => {
    updateCategory.mutate(
      {
        id: payload.id,
        payload: {
          name: payload.name,
          slug: payload.slug
        }
      },
      {
        onSuccess: () => setEditingEntityId(null)
      }
    );
  };

  const deleteSelected = async () => {
    const deletedIds = Object.keys(rowSelection);
    if (deletedIds.length === 0) return;

    try {
      await deleteCategories.mutateAsync(deletedIds);
      setRowSelection({});
    } catch {
      // Handled by mutation onError.
    }
  };

  return {
    list,
    metadata,
    isLoadingList,
    rowSelection,
    setRowSelection,
    page,
    setPage,
    search,
    setSearch,
    isOpenAdd,
    setIsOpenAdd,
    addCategory,
    editCategory,
    deleteSelected,
    isPendingAdd: createCategory.isPending,
    isPendingEdit: updateCategory.isPending,
    isPendingDelete: deleteCategories.isPending,
    editDialogControl
  };
}
