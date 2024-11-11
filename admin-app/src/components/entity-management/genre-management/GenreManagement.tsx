import { useCallback, useEffect, useRef, useState } from "react";

import { genreService } from "@/services/entity.service";

import DataTable from "@/components/data-table/DataTable";
import { genreColumns } from "@/components/entity-management/genre-management/GenreTableColumns";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";

import { useToast } from "@/hooks/useToast";

import { MetadataResponse } from "@/types/api.type";
import { GenreWithMediaCount } from "@/types/entity.type";

import { SearchIcon } from "lucide-react";
import { useDebounce } from "use-debounce";

import AddEntityDialog from "../AddEntityDialog";

type Props = {
  resetParent: () => Promise<void>;
};

export default function GenreManagement({ resetParent }: Props) {
  const [genreList, setGenreList] = useState<GenreWithMediaCount[]>([]);
  const [genreMetadata, setGenreMetadata] = useState<MetadataResponse>();

  const [isLoadingGenre, setIsLoadingGenre] = useState(false);
  const [isLoadingAddGenre, setIsLoadingAddGenre] = useState(false);
  const [isLoadingEditGenre, setIsLoadingEditGenre] = useState(false);
  const [isLoadingDeleteGenre, setIsLoadingDeleteGenre] = useState(false);

  const [selectedGenreRows, setSelectedGenreRows] = useState({});
  const [genreListPage, setGenreListPage] = useState(1);
  const [searchGenre, setSearchGenre] = useState("");
  const [debouncedSearch] = useDebounce(searchGenre, 1000);

  const [isOpenAddGenre, setIsOpenAddGenre] = useState(false);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const fetchGenreList = useCallback(async () => {
    setIsLoadingGenre(true);
    const response = await genreService.fetchAllWithMediaCount<
      GenreWithMediaCount[]
    >(genreListPage, 5, debouncedSearch);
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

  const addGenre = async (name: string) => {
    setIsLoadingAddGenre(true);
    const response = await genreService.addEntity(name);
    if (response.success) {
      fetchGenreList();
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
      resetParent();
      setIsOpenAddGenre(false);
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAddGenre(false);
  };

  const editGenre = async (id: string, name: string) => {
    setIsLoadingEditGenre(true);
    const response = await genreService.updateEntity(id, name);
    if (response.success) {
      fetchGenreList();
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
      resetParent();
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setIsLoadingEditGenre(false);
  };

  const deleteGenre = async () => {
    setIsLoadingDeleteGenre(true);
    const deletedIds = Object.keys(selectedGenreRows);
    const response = await genreService.deleteEntity(deletedIds);
    if (response.success) {
      fetchGenreList();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} genre(s) deleted successfully`
      });
      resetParent();
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setSelectedGenreRows({});
    setIsLoadingDeleteGenre(false);
  };

  useEffect(() => {
    fetchGenreList();
  }, [fetchGenreList]);

  return (
    <TabsContent value="genres">
      <DataTable
        columns={genreColumns(editGenre, isLoadingEditGenre)}
        data={genreList}
        rowSelection={selectedGenreRows}
        setRowSelection={setSelectedGenreRows}
        deleteData={deleteGenre}
        isLoadingData={isLoadingGenre}
        isLoadingDeleteData={isLoadingDeleteGenre}
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
            isLoadingAddEntity={isLoadingAddGenre}
          />
        }
      />
    </TabsContent>
  );
}
