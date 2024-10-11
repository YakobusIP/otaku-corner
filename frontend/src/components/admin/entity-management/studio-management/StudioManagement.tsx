import { TabsContent } from "@/components/ui/tabs";
import DataTable from "@/components/admin/data-table/DataTable";
import { studioColumns } from "@/components/admin/entity-management/studio-management/StudioTableColumns";
import { StudioWithMediaCount } from "@/types/entity.type";
import { useCallback, useEffect, useRef, useState } from "react";
import { studioService } from "@/services/entity.service";
import { useToast } from "@/components/ui/use-toast";
import { MetadataResponse } from "@/types/api.type";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import AddEntityDialog from "../AddEntityDialog";
import { useDebounce } from "use-debounce";

type Props = {
  resetParent: () => Promise<void>;
};

export default function StudioManagement({ resetParent }: Props) {
  const [studioList, setStudioList] = useState<StudioWithMediaCount[]>([]);
  const [studioMetadata, setStudioMetadata] = useState<MetadataResponse>();

  const [isLoadingStudio, setIsLoadingStudio] = useState(false);
  const [isLoadingAddStudio, setIsLoadingAddStudio] = useState(false);
  const [isLoadingEditStudio, setIsLoadingEditStudio] = useState(false);
  const [isLoadingDeleteStudio, setIsLoadingDeleteStudio] = useState(false);

  const [selectedStudioRows, setSelectedStudioRows] = useState({});
  const [studioListPage, setStudioListPage] = useState(1);
  const [searchStudio, setSearchStudio] = useState("");
  const [debouncedSearch] = useDebounce(searchStudio, 1000);

  const [isOpenAddStudio, setIsOpenAddStudio] = useState(false);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const fetchStudioList = useCallback(async () => {
    setIsLoadingStudio(true);
    const response = await studioService.fetchAllWithMediaCount<
      StudioWithMediaCount[]
    >(studioListPage, 5, debouncedSearch);
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

  const addStudio = async (name: string) => {
    setIsLoadingAddStudio(true);
    const response = await studioService.addEntity(name);
    if (response.success) {
      fetchStudioList();
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
      resetParent();
      setIsOpenAddStudio(false);
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAddStudio(false);
  };

  const editStudio = async (id: string, name: string) => {
    setIsLoadingEditStudio(true);
    const response = await studioService.updateEntity(id, name);
    if (response.success) {
      fetchStudioList();
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
    setIsLoadingEditStudio(false);
  };

  const deleteStudio = async () => {
    setIsLoadingDeleteStudio(true);
    const deletedIds = Object.keys(selectedStudioRows);
    const response = await studioService.deleteEntity(deletedIds);
    if (response.success) {
      fetchStudioList();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} studio(s) deleted successfully`
      });
      resetParent();
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setSelectedStudioRows({});
    setIsLoadingDeleteStudio(false);
  };

  useEffect(() => {
    fetchStudioList();
  }, [fetchStudioList]);

  return (
    <TabsContent value="studios">
      <DataTable
        columns={studioColumns(editStudio, isLoadingEditStudio)}
        data={studioList}
        rowSelection={selectedStudioRows}
        setRowSelection={setSelectedStudioRows}
        deleteData={deleteStudio}
        isLoadingData={isLoadingStudio}
        isLoadingDeleteData={isLoadingDeleteStudio}
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
            isLoadingAddEntity={isLoadingAddStudio}
          />
        }
      />
    </TabsContent>
  );
}
