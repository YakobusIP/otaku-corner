import { useCallback, useEffect, useRef, useState } from "react";

import { themeService } from "@/services/entity.service";

import DataTable from "@/components/data-table/DataTable";
import AddEntityDialog from "@/components/entity-management/AddEntityDialog";
import { themeColumns } from "@/components/entity-management/theme-management/ThemeTableColumns";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";

import { useToast } from "@/hooks/useToast";
import { entityKeys } from "@/lib/query-keys";

import { MetadataResponse } from "@/types/api.type";
import { ThemeWithMediaCount } from "@/types/entity.type";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "use-debounce";

type Props = {
  resetParent: () => Promise<void>;
};

export default function ThemeManagement({ resetParent }: Props) {
  const [themeList, setThemeList] = useState<ThemeWithMediaCount[]>([]);
  const [themeMetadata, setThemeMetadata] = useState<MetadataResponse>();

  const [isLoadingTheme, setIsLoadingTheme] = useState(false);

  const [selectedThemeRows, setSelectedThemeRows] = useState({});
  const [themeListPage, setThemeListPage] = useState(1);
  const [searchTheme, setSearchTheme] = useState("");
  const [debouncedSearch] = useDebounce(searchTheme, 1000);

  const [isOpenAddTheme, setIsOpenAddTheme] = useState(false);

  const toast = useToast();
  const queryClient = useQueryClient();

  const toastRef = useRef(toast.toast);

  const fetchThemeList = useCallback(async () => {
    setIsLoadingTheme(true);
    const response = await themeService.fetchAllWithMediaCount<ThemeWithMediaCount>(
      themeListPage,
      5,
      debouncedSearch
    );
    if (response.success) {
      setThemeList(response.data.data);
      setThemeMetadata(response.data.metadata);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingTheme(false);
  }, [themeListPage, debouncedSearch]);

  const addThemeMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await themeService.addEntity(name);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.themes() });
      await fetchThemeList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: "Theme added successfully"
      });
      setIsOpenAddTheme(false);
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const editThemeMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await themeService.updateEntity(id, name);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.themes() });
      await fetchThemeList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: "Theme updated successfully"
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

  const deleteThemeMutation = useMutation({
    mutationFn: async (deletedIds: number[]) => {
      const response = await themeService.deleteEntity(deletedIds);
      if (!response.success) throw new Error(response.error);
      return deletedIds;
    },
    onSuccess: async (deletedIds) => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.themes() });
      await fetchThemeList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} theme(s) deleted successfully`
      });
      setSelectedThemeRows({});
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
      setSelectedThemeRows({});
    }
  });

  const addTheme = (name: string) => {
    addThemeMutation.mutate(name);
  };

  const editTheme = (id: number, name: string) => {
    editThemeMutation.mutate({ id, name });
  };

  const deleteTheme = async () => {
    const deletedIds = Object.keys(selectedThemeRows).map((id) => parseInt(id));
    try {
      await deleteThemeMutation.mutateAsync(deletedIds);
    } catch {
      // Handled by mutation onError.
    }
  };

  useEffect(() => {
    fetchThemeList();
  }, [fetchThemeList]);

  return (
    <TabsContent value="themes">
      <DataTable
        columns={themeColumns(editTheme, editThemeMutation.isPending)}
        data={themeList}
        rowSelection={selectedThemeRows}
        setRowSelection={setSelectedThemeRows}
        deleteData={deleteTheme}
        isLoadingData={isLoadingTheme}
        isLoadingDeleteData={deleteThemeMutation.isPending}
        page={themeListPage}
        setPage={setThemeListPage}
        metadata={themeMetadata}
        searchComponent={
          <Input
            type="text"
            placeholder="Search theme"
            startIcon={SearchIcon}
            parentClassName="w-full xl:w-fit"
            className="w-full xl:w-[300px]"
            onChange={(e) => setSearchTheme(e.target.value)}
          />
        }
        addNewDataComponent={
          <AddEntityDialog
            isOpenDialog={isOpenAddTheme}
            setIsOpenDialog={setIsOpenAddTheme}
            entityType="Theme"
            addHandler={addTheme}
            isLoadingAddEntity={addThemeMutation.isPending}
          />
        }
      />
    </TabsContent>
  );
}
