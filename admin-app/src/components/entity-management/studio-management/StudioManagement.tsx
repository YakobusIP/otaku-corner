import { useCallback, useEffect, useRef, useState } from "react";

import { studioService } from "@/services/entity.service";

import DataTable from "@/components/data-table/DataTable";
import AddEntityDialog from "@/components/entity-management/AddEntityDialog";
import { studioColumns } from "@/components/entity-management/studio-management/StudioTableColumns";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";

import { useToast } from "@/hooks/useToast";
import { entityKeys } from "@/lib/query-keys";

import { MetadataResponse } from "@/types/api.type";
import { StudioWithMediaCount } from "@/types/entity.type";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "use-debounce";

type Props = {
  resetParent: () => Promise<void>;
};

export default function StudioManagement({ resetParent }: Props) {
  const [studioList, setStudioList] = useState<StudioWithMediaCount[]>([]);
  const [studioMetadata, setStudioMetadata] = useState<MetadataResponse>();

  const [isLoadingStudio, setIsLoadingStudio] = useState(false);

  const [selectedStudioRows, setSelectedStudioRows] = useState({});
  const [studioListPage, setStudioListPage] = useState(1);
  const [searchStudio, setSearchStudio] = useState("");
  const [debouncedSearch] = useDebounce(searchStudio, 1000);

  const [isOpenAddStudio, setIsOpenAddStudio] = useState(false);

  const toast = useToast();
  const queryClient = useQueryClient();

  const toastRef = useRef(toast.toast);

  const fetchStudioList = useCallback(async () => {
    setIsLoadingStudio(true);
    const response = await studioService.fetchAllWithMediaCount<StudioWithMediaCount>(
      studioListPage,
      5,
      debouncedSearch
    );
    if (response.success) {
      setStudioList(response.data.data);
      setStudioMetadata(response.data.metadata);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingStudio(false);
  }, [studioListPage, debouncedSearch]);

  const addStudioMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await studioService.addEntity(name);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.studios() });
      await fetchStudioList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: "Studio added successfully"
      });
      setIsOpenAddStudio(false);
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const editStudioMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await studioService.updateEntity(id, name);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.studios() });
      await fetchStudioList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: "Studio updated successfully"
      });
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const deleteStudioMutation = useMutation({
    mutationFn: async (deletedIds: number[]) => {
      const response = await studioService.deleteEntity(deletedIds);
      if (!response.success) throw new Error(response.error);
      return deletedIds;
    },
    onSuccess: async (deletedIds) => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.studios() });
      await fetchStudioList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} studio(s) deleted successfully`
      });
      setSelectedStudioRows({});
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
      setSelectedStudioRows({});
    }
  });

  const addStudio = (name: string) => {
    addStudioMutation.mutate(name);
  };

  const editStudio = (id: number, name: string) => {
    editStudioMutation.mutate({ id, name });
  };

  const deleteStudio = async () => {
    const deletedIds = Object.keys(selectedStudioRows).map((id) =>
      parseInt(id)
    );
    try {
      await deleteStudioMutation.mutateAsync(deletedIds);
    } catch {
      // Handled by mutation onError.
    }
  };

  useEffect(() => {
    fetchStudioList();
  }, [fetchStudioList]);

  return (
    <TabsContent value="studios">
      <DataTable
        columns={studioColumns(editStudio, editStudioMutation.isPending)}
        data={studioList}
        rowSelection={selectedStudioRows}
        setRowSelection={setSelectedStudioRows}
        deleteData={deleteStudio}
        isLoadingData={isLoadingStudio}
        isLoadingDeleteData={deleteStudioMutation.isPending}
        page={studioListPage}
        setPage={setStudioListPage}
        metadata={studioMetadata}
        searchComponent={
          <Input
            type="text"
            placeholder="Search studio"
            startIcon={SearchIcon}
            parentClassName="w-full xl:w-fit"
            className="w-full xl:w-[300px]"
            onChange={(e) => setSearchStudio(e.target.value)}
          />
        }
        addNewDataComponent={
          <AddEntityDialog
            isOpenDialog={isOpenAddStudio}
            setIsOpenDialog={setIsOpenAddStudio}
            entityType="Studio"
            addHandler={addStudio}
            isLoadingAddEntity={addStudioMutation.isPending}
          />
        }
      />
    </TabsContent>
  );
}
