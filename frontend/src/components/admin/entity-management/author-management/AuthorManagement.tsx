import { TabsContent } from "@/components/ui/tabs";
import DataTable from "@/components/admin/data-table/DataTable";
import { authorColumns } from "@/components/admin/entity-management/author-management/AuthorTableColumns";
import { AuthorWithMediaCount } from "@/types/entity.type";
import { useCallback, useEffect, useRef, useState } from "react";
import { authorService } from "@/services/entity.service";
import { useToast } from "@/components/ui/use-toast";
import { MetadataResponse } from "@/types/api.type";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AddEntityDialog from "../AddEntityDialog";
import { useDebounce } from "use-debounce";

type Props = {
  resetParent: () => Promise<void>;
};

export default function AuthorManagement({ resetParent }: Props) {
  const [authorList, setAuthorList] = useState<AuthorWithMediaCount[]>([]);
  const [authorMetadata, setAuthorMetadata] = useState<MetadataResponse>();

  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);
  const [isLoadingAddAuthor, setIsLoadingAddAuthor] = useState(false);
  const [isLoadingEditAuthor, setIsLoadingEditAuthor] = useState(false);
  const [isLoadingDeleteAuthor, setIsLoadingDeleteAuthor] = useState(false);

  const [selectedAuthorRows, setSelectedAuthorRows] = useState({});
  const [authorListPage, setAuthorListPage] = useState(1);
  const [searchAuthor, setSearchAuthor] = useState("");
  const [debouncedSearch] = useDebounce(searchAuthor, 1000);

  const [isOpenAddAuthor, setIsOpenAddAuthor] = useState(false);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const fetchAuthorList = useCallback(async () => {
    setIsLoadingAuthor(true);
    const response = await authorService.fetchAllWithMediaCount<
      AuthorWithMediaCount[]
    >(authorListPage, 5, debouncedSearch);
    if (response.success) {
      setAuthorList(response.data.data);
      setAuthorMetadata(response.data.metadata);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAuthor(false);
  }, [authorListPage, debouncedSearch]);

  const addAuthor = async (name: string) => {
    setIsLoadingAddAuthor(true);
    const response = await authorService.addEntity(name);
    if (response.success) {
      fetchAuthorList();
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
      resetParent();
      setIsOpenAddAuthor(false);
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAddAuthor(false);
  };

  const editAuthor = async (id: string, name: string) => {
    setIsLoadingEditAuthor(true);
    const response = await authorService.updateEntity(id, name);
    if (response.success) {
      fetchAuthorList();
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
    setIsLoadingEditAuthor(false);
  };

  const deleteAuthor = async () => {
    setIsLoadingDeleteAuthor(true);
    const deletedIds = Object.keys(selectedAuthorRows);
    const response = await authorService.deleteEntity(deletedIds);
    if (response.success) {
      fetchAuthorList();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} author(s) deleted successfully`
      });
      resetParent();
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setSelectedAuthorRows({});
    setIsLoadingDeleteAuthor(false);
  };

  useEffect(() => {
    fetchAuthorList();
  }, [fetchAuthorList]);

  return (
    <TabsContent value="authors">
      <DataTable
        columns={authorColumns(editAuthor, isLoadingEditAuthor)}
        data={authorList}
        rowSelection={selectedAuthorRows}
        setRowSelection={setSelectedAuthorRows}
        deleteData={deleteAuthor}
        isLoadingData={isLoadingAuthor}
        isLoadingDeleteData={isLoadingDeleteAuthor}
        page={authorListPage}
        setPage={setAuthorListPage}
        metadata={authorMetadata}
        searchComponent={
          <Input
            type="text"
            placeholder="Search author"
            startIcon={Search}
            parentClassName="w-full xl:w-fit"
            className="w-full xl:w-[300px]"
            onChange={(e) => setSearchAuthor(e.target.value)}
          />
        }
        addNewDataComponent={
          <AddEntityDialog
            isOpenDialog={isOpenAddAuthor}
            setIsOpenDialog={setIsOpenAddAuthor}
            entityType="Author"
            addHandler={addAuthor}
            isLoadingAddEntity={isLoadingAddAuthor}
          />
        }
      />
    </TabsContent>
  );
}
