import { useCallback, useEffect, useRef, useState } from "react";

import { authorService } from "@/services/entity.service";

import DataTable from "@/components/data-table/DataTable";
import AddEntityDialog from "@/components/entity-management/AddEntityDialog";
import { authorColumns } from "@/components/entity-management/author-management/AuthorTableColumns";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";

import { useToast } from "@/hooks/useToast";

import { MetadataResponse } from "@/types/api.type";
import { AuthorWithMediaCount } from "@/types/entity.type";

import { entityKeys } from "@/lib/query-keys";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "use-debounce";

type Props = {
  resetParent: () => Promise<void>;
};

export default function AuthorManagement({ resetParent }: Props) {
  const [authorList, setAuthorList] = useState<AuthorWithMediaCount[]>([]);
  const [authorMetadata, setAuthorMetadata] = useState<MetadataResponse>();

  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);

  const [selectedAuthorRows, setSelectedAuthorRows] = useState({});
  const [authorListPage, setAuthorListPage] = useState(1);
  const [searchAuthor, setSearchAuthor] = useState("");
  const [debouncedSearch] = useDebounce(searchAuthor, 1000);

  const [isOpenAddAuthor, setIsOpenAddAuthor] = useState(false);

  const toast = useToast();
  const queryClient = useQueryClient();

  const toastRef = useRef(toast.toast);

  const fetchAuthorList = useCallback(async () => {
    setIsLoadingAuthor(true);
    const response =
      await authorService.fetchAll<AuthorWithMediaCount>({
        page: authorListPage,
        limit: 10,
        query: debouncedSearch
      });
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

  const addAuthorMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await authorService.addEntity(name);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.authors() });
      await fetchAuthorList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: "Author added successfully"
      });
      setIsOpenAddAuthor(false);
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const editAuthorMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await authorService.updateEntity(id, name);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.authors() });
      await fetchAuthorList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: "Author updated successfully"
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

  const deleteAuthorMutation = useMutation({
    mutationFn: async (deletedIds: number[]) => {
      const response = await authorService.deleteEntity(deletedIds);
      if (!response.success) throw new Error(response.error);
      return deletedIds;
    },
    onSuccess: async (deletedIds) => {
      await queryClient.invalidateQueries({ queryKey: entityKeys.authors() });
      await fetchAuthorList();
      await resetParent();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} author(s) deleted successfully`
      });
      setSelectedAuthorRows({});
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
      setSelectedAuthorRows({});
    }
  });

  const addAuthor = (name: string) => {
    addAuthorMutation.mutate(name);
  };

  const editAuthor = (id: number, name: string) => {
    editAuthorMutation.mutate({ id, name });
  };

  const deleteAuthor = async () => {
    const deletedIds = Object.keys(selectedAuthorRows).map((id) =>
      parseInt(id)
    );
    try {
      await deleteAuthorMutation.mutateAsync(deletedIds);
    } catch {
      // Handled by mutation onError.
    }
  };

  useEffect(() => {
    fetchAuthorList();
  }, [fetchAuthorList]);

  return (
    <TabsContent value="authors">
      <DataTable
        columns={authorColumns(editAuthor, editAuthorMutation.isPending)}
        data={authorList}
        rowSelection={selectedAuthorRows}
        setRowSelection={setSelectedAuthorRows}
        deleteData={deleteAuthor}
        isLoadingData={isLoadingAuthor}
        isLoadingDeleteData={deleteAuthorMutation.isPending}
        page={authorListPage}
        setPage={setAuthorListPage}
        metadata={authorMetadata}
        searchComponent={
          <Input
            type="text"
            placeholder="Search author"
            startIcon={SearchIcon}
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
            isLoadingAddEntity={addAuthorMutation.isPending}
          />
        }
      />
    </TabsContent>
  );
}
