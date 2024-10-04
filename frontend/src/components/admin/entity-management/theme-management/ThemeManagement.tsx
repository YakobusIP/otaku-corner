import { TabsContent } from "@/components/ui/tabs";
import DataTable from "@/components/admin/data-table/DataTable";
import { themeColumns } from "@/components/admin/entity-management/theme-management/ThemeTableColumns";
import { ThemeWithMediaCount } from "@/types/entity.type";
import { useCallback, useEffect, useRef, useState } from "react";
import { themeService } from "@/services/entity.service";
import { useToast } from "@/components/ui/use-toast";
import { MetadataResponse } from "@/types/api.type";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AddEntityDialog from "../AddEntityDialog";
import { useDebounce } from "use-debounce";

type Props = {
  resetParent: () => Promise<void>;
};

export default function ThemeManagement({ resetParent }: Props) {
  const [themeList, setThemeList] = useState<ThemeWithMediaCount[]>([]);
  const [themeMetadata, setThemeMetadata] = useState<MetadataResponse>();

  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [isLoadingAddTheme, setIsLoadingAddTheme] = useState(false);
  const [isLoadingEditTheme, setIsLoadingEditTheme] = useState(false);
  const [isLoadingDeleteTheme, setIsLoadingDeleteTheme] = useState(false);

  const [selectedThemeRows, setSelectedThemeRows] = useState({});
  const [themeListPage, setThemeListPage] = useState(1);
  const [searchTheme, setSearchTheme] = useState("");
  const [debouncedSearch] = useDebounce(searchTheme, 1000);

  const [isOpenAddTheme, setIsOpenAddTheme] = useState(false);

  const toast = useToast();

  const toastRef = useRef(toast.toast);

  const fetchThemeList = useCallback(async () => {
    setIsLoadingTheme(true);
    const response = await themeService.fetchAllWithMediaCount<
      ThemeWithMediaCount[]
    >(themeListPage, 5, debouncedSearch);
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

  const addTheme = async (name: string) => {
    setIsLoadingAddTheme(true);
    const response = await themeService.addEntity(name);
    if (response.success) {
      fetchThemeList();
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
      resetParent();
      setIsOpenAddTheme(false);
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAddTheme(false);
  };

  const editTheme = async (id: number, name: string) => {
    setIsLoadingEditTheme(true);
    const response = await themeService.updateEntity(id, name);
    if (response.success) {
      fetchThemeList();
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
    setIsLoadingEditTheme(false);
  };

  const deleteTheme = async () => {
    setIsLoadingDeleteTheme(true);
    const deletedIds = Object.keys(selectedThemeRows).map((selected) =>
      parseInt(selected)
    );
    const response = await themeService.deleteEntity(deletedIds);
    if (response.success) {
      fetchThemeList();
      toast.toast({
        title: "All set!",
        description: `${deletedIds.length} theme(s) deleted successfully`
      });
      resetParent();
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: "There was a problem with your request."
      });
    }
    setSelectedThemeRows({});
    setIsLoadingDeleteTheme(false);
  };

  useEffect(() => {
    fetchThemeList();
  }, [fetchThemeList]);

  return (
    <TabsContent value="themes">
      <DataTable
        columns={themeColumns(editTheme, isLoadingEditTheme)}
        data={themeList}
        rowSelection={selectedThemeRows}
        setRowSelection={setSelectedThemeRows}
        deleteData={deleteTheme}
        isLoadingData={isLoadingTheme}
        isLoadingDeleteData={isLoadingDeleteTheme}
        page={themeListPage}
        setPage={setThemeListPage}
        metadata={themeMetadata}
        searchComponent={
          <Input
            type="text"
            placeholder="Search theme"
            startIcon={Search}
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
            isLoadingAddEntity={isLoadingAddTheme}
          />
        }
      />
    </TabsContent>
  );
}
