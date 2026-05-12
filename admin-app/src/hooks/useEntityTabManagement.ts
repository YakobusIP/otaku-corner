import { useEffect, useMemo, useState } from "react";

import type { EntityCrudService } from "@/services/entity.service";

import { toast } from "@/hooks/useToast";

import type { PaginatedListPage } from "@/types/general.type";

import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import type { RowSelectionState } from "@tanstack/react-table";
import { useDebounce } from "use-debounce";

const PAGE_SIZE = 10;

export type EntityEditDialogControl = {
  isOpenFor: (entityId: number) => boolean;
  onOpenChange: (entityId: number, open: boolean) => void;
};

export type UseEntityTabManagementParams = {
  resetParent: () => Promise<void>;
  enabled: boolean;
  entityTypeLabel: string;
  entityNounLower: string;
  entityQueryKey: QueryKey;
  service: EntityCrudService;
};

export function useEntityTabManagement<T extends { id: number }>({
  resetParent,
  enabled,
  entityTypeLabel,
  entityNounLower,
  entityQueryKey,
  service
}: UseEntityTabManagementParams) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 1000);

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [editingEntityId, setEditingEntityId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const listQuery = useQuery({
    queryKey: [...entityQueryKey, "tabList", PAGE_SIZE, page, debouncedSearch],
    enabled,
    queryFn: async (): Promise<PaginatedListPage<T>> => {
      const response = await service.fetchAll<T>({
        page,
        limit: PAGE_SIZE,
        query: debouncedSearch,
        connectedMedia: true
      });
      if (!response.success) throw new Error(response.error);
      return response.data;
    }
  });

  useEffect(() => {
    if (!listQuery.isError || !listQuery.error) return;
    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong",
      description: listQuery.error.message
    });
  }, [listQuery.isError, listQuery.error]);

  const list = listQuery.data?.data ?? [];
  const metadata = listQuery.data?.metadata;
  const isLoadingList = listQuery.isFetching;

  const editDialogControl = useMemo<EntityEditDialogControl>(
    () => ({
      isOpenFor: (id) => editingEntityId === id,
      onOpenChange: (id, open) => {
        if (open) setEditingEntityId(id);
        else setEditingEntityId((cur) => (cur === id ? null : cur));
      }
    }),
    [editingEntityId]
  );

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await service.addEntity(name);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityQueryKey });
      await resetParent();
      toast({
        title: "All set!",
        description: `${entityTypeLabel} added successfully`
      });
      setIsOpenAdd(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await service.updateEntity(id, name);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityQueryKey });
      await resetParent();
      toast({
        title: "All set!",
        description: `${entityTypeLabel} updated successfully`
      });
      setEditingEntityId(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (deletedIds: number[]) => {
      const response = await service.deleteEntity(deletedIds);
      if (!response.success) throw new Error(response.error);
      return deletedIds;
    },
    onSuccess: async (deletedIds) => {
      await queryClient.invalidateQueries({ queryKey: entityQueryKey });
      await resetParent();
      toast({
        title: "All set!",
        description: `${deletedIds.length} ${entityNounLower}(s) deleted successfully`
      });
      setRowSelection({});
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
      setRowSelection({});
    }
  });

  const addEntity = (name: string) => {
    addMutation.mutate(name);
  };

  const editEntity = (id: number, name: string) => {
    editMutation.mutate({ id, name });
  };

  const deleteSelected = async () => {
    const deletedIds = Object.keys(rowSelection).map((id) => parseInt(id, 10));
    try {
      await deleteMutation.mutateAsync(deletedIds);
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
    addEntity,
    editEntity,
    deleteSelected,
    isPendingAdd: addMutation.isPending,
    isPendingEdit: editMutation.isPending,
    isPendingDelete: deleteMutation.isPending,
    editDialogControl
  };
}
