import { useCallback, useEffect, useRef, useState } from "react";

import { genreService } from "@/services/entity.service";

import DataTable from "@/components/data-table/DataTable";
import AddEntityDialog from "@/components/entity-management/AddEntityDialog";
import { genreColumns } from "@/components/entity-management/genre-management/GenreTableColumns";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";

import { useToast } from "@/hooks/useToast";

import { MetadataResponse } from "@/types/api.type";
import { GenreWithMediaCount } from "@/types/entity.type";

import { entityKeys } from "@/lib/query-keys";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "use-debounce";

type Props = {
  resetParent: () => Promise<void>;
};

export default function GenreManagement({ resetParent }: Props) {
  const [genreList, setGenreList] = useState<GenreWithMediaCount[]>([]);
  const [genreMetadata, setGenreMetadata] = useState<MetadataResponse>();

  const [isLoadingGenre, setIsLoadingGenre] = useState(false);

  const [selectedGenreRows, setSelectedGenreRows] = useState({});
  const [genreListPage, setGenreListPage] = useState(1);
  const [searchGenre, setSearchGenre] = useState("");
  const [debouncedSearch] = useDebounce(searchGenre, 1000);

  const [isOpenAddGenre, setIsOpenAddGenre] = useState(false);

  const toast = useToast();
  const queryClient = useQueryClient();

  const toastRef = useRef(toast.toast);

  const fetchGenreList = useCallback(async () => {
    setIsLoadingGenre(true);
    const response =
      await genreService.fetchAllWithMediaCount<GenreWithMediaCount>(
        genreListPage,
        5,
        debouncedSearch
      );
    if (response.success) {
      setGenreList(response.data.data);
      setGenreMetadata(response.data.metadata);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingGenre(false);
  }, [genreListPage, debouncedSearch]);

  const addGenreMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await genreService.addEntity(name);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.genres() });
      await fetchGenreList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: "Genre added successfully"
      });
      setIsOpenAddGenre(false);
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const editGenreMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await genreService.updateEntity(id, name);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.genres() });
      await fetchGenreList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: "Genre updated successfully"
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

  const deleteGenreMutation = useMutation({
    mutationFn: async (deletedIds: number[]) => {
      const response = await genreService.deleteEntity(deletedIds);
      if (!response.success) throw new Error(response.error);
      return deletedIds;
    },
    onSuccess: async (deletedIds) => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.genres() });
      await fetchGenreList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} genre(s) deleted successfully`
      });
      setSelectedGenreRows({});
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
      setSelectedGenreRows({});
    }
  });

  const addGenre = (name: string) => {
    addGenreMutation.mutate(name);
  };

  const editGenre = (id: number, name: string) => {
    editGenreMutation.mutate({ id, name });
  };

  const deleteGenre = async () => {
    const deletedIds = Object.keys(selectedGenreRows).map((id) => parseInt(id));
    try {
      await deleteGenreMutation.mutateAsync(deletedIds);
    } catch {
      // Handled by mutation onError.
    }
  };

  useEffect(() => {
    fetchGenreList();
  }, [fetchGenreList]);

  return (
    <TabsContent value="genres">
      <DataTable
        columns={genreColumns(editGenre, editGenreMutation.isPending)}
        data={genreList}
        rowSelection={selectedGenreRows}
        setRowSelection={setSelectedGenreRows}
        deleteData={deleteGenre}
        isLoadingData={isLoadingGenre}
        isLoadingDeleteData={deleteGenreMutation.isPending}
        page={genreListPage}
        setPage={setGenreListPage}
        metadata={genreMetadata}
        searchComponent={
          <Input
            type="text"
            placeholder="Search genre"
            startIcon={SearchIcon}
            parentClassName="w-full xl:w-fit"
            className="w-full xl:w-[300px]"
            onChange={(e) => setSearchGenre(e.target.value)}
          />
        }
        addNewDataComponent={
          <AddEntityDialog
            isOpenDialog={isOpenAddGenre}
            setIsOpenDialog={setIsOpenAddGenre}
            entityType="Genre"
            addHandler={addGenre}
            isLoadingAddEntity={addGenreMutation.isPending}
          />
        }
      />
    </TabsContent>
  );
}
