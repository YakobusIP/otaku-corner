import { useEffect, useMemo, useState } from "react";

import {
  useImageVaultModels,
  useImageVaultMutations
} from "@/hooks/useImageVaultQueries";

import type {
  ImageVaultCatalogEditDialogControl,
  ImageVaultModel
} from "@/types/image-vault.type";

import type { RowSelectionState } from "@tanstack/react-table";
import { useDebounce } from "use-debounce";

const PAGE_SIZE = 10;

export type EditModelPayload = {
  id: string;
  name: string;
  provider: string;
  isActive: boolean;
};

export function useImageVaultModelManagement(enabled: boolean) {
  const { data: allModels = [], isFetching: isLoadingList } =
    useImageVaultModels(enabled);
  const { createModel, updateModel, deleteModels } = useImageVaultMutations();

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
    if (!query) return allModels;

    return allModels.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query)
    );
  }, [allModels, debouncedSearch]);

  const metadata = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      pageCount: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
      itemCount: filtered.length
    }),
    [filtered.length, page]
  );

  const list = useMemo((): ImageVaultModel[] => {
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

  const addModel = (payload: { name: string; provider: string }) => {
    createModel.mutate(payload, {
      onSuccess: () => setIsOpenAdd(false)
    });
  };

  const editModel = (payload: EditModelPayload) => {
    updateModel.mutate(
      {
        id: payload.id,
        payload: {
          name: payload.name,
          provider: payload.provider,
          isActive: payload.isActive
        }
      },
      {
        onSuccess: () => setEditingEntityId(null)
      }
    );
  };

  const toggleActive = (id: string, isActive: boolean) => {
    updateModel.mutate({ id, payload: { isActive } });
  };

  const deleteSelected = async () => {
    const deletedIds = Object.keys(rowSelection);
    if (deletedIds.length === 0) return;

    try {
      await deleteModels.mutateAsync(deletedIds);
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
    addModel,
    editModel,
    toggleActive,
    deleteSelected,
    isPendingAdd: createModel.isPending,
    isPendingEdit: updateModel.isPending,
    isPendingDelete: deleteModels.isPending,
    editDialogControl
  };
}
