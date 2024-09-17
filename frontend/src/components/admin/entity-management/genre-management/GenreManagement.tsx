import { TabsContent } from "@/components/ui/tabs";
import DataTable from "@/components/admin/data-table/DataTable";
import { genreColumns } from "@/components/admin/entity-management/genre-management/GenreTableColumns";
import { GenreWithMediaCount } from "@/types/entity.type";
import { useCallback, useEffect, useRef, useState } from "react";
import { genreService } from "@/services/entity.service";
import { useToast } from "@/components/ui/use-toast";
import { MetadataResponse } from "@/types/api.type";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AddEntityDialog from "../AddEntityDialog";
import { useDebounce } from "use-debounce";

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
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAddGenre(false);
  };

  const editGenre = async (id: number, name: string) => {
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
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setIsLoadingEditGenre(false);
  };

  const deleteGenre = async () => {
    setIsLoadingDeleteGenre(true);
    const deletedIds = Object.keys(selectedGenreRows).map((selected) =>
      parseInt(selected)
    );
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
            startIcon={Search}
            parentClassName="w-full lg:w-fit"
            className="w-full lg:w-[300px]"
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
