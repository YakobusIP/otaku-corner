import DataTable from "@/components/data-table/DataTable";
import AddEntityDialog from "@/components/entity-management/AddEntityDialog";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";

import {
  type EntityEditDialogControl,
  type UseEntityTabManagementParams,
  useEntityTabManagement
} from "@/hooks/useEntityTabManagement";

import { ColumnDef } from "@tanstack/react-table";
import { SearchIcon } from "lucide-react";

type EntityTabManagementProps<T extends { id: number }> =
  UseEntityTabManagementParams & {
    tabValue: string;
    getColumns: (
      editEntity: (id: number, name: string) => void,
      isPendingEdit: boolean,
      entityTypeLabel: string,
      editDialogControl: EntityEditDialogControl
    ) => ColumnDef<T, unknown>[];
  };

export default function EntityTabManagement<T extends { id: number }>({
  resetParent,
  enabled,
  tabValue,
  entityTypeLabel,
  entityNounLower,
  entityQueryKey,
  service,
  getColumns
}: EntityTabManagementProps<T>) {
  const {
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
    isPendingAdd,
    isPendingEdit,
    isPendingDelete,
    editDialogControl
  } = useEntityTabManagement<T>({
    resetParent,
    enabled,
    entityTypeLabel,
    entityNounLower,
    entityQueryKey,
    service
  });

  return (
    <TabsContent
      value={tabValue}
      className="mt-0 flex min-h-0 w-full min-w-0 flex-1 flex-col outline-none data-[state=inactive]:hidden"
    >
      <DataTable
        columns={getColumns(
          editEntity,
          isPendingEdit,
          entityTypeLabel,
          editDialogControl
        )}
        data={list}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        deleteData={deleteSelected}
        isLoadingData={isLoadingList}
        isLoadingDeleteData={isPendingDelete}
        page={page}
        setPage={setPage}
        metadata={metadata}
        searchComponent={
          <Input
            type="text"
            placeholder={`Search ${entityNounLower}`}
            startIcon={SearchIcon}
            parentClassName="w-full min-w-0"
            className="bg-background/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
        addNewDataComponent={
          <AddEntityDialog
            isOpenDialog={isOpenAdd}
            setIsOpenDialog={setIsOpenAdd}
            entityType={entityTypeLabel}
            addHandler={addEntity}
            isLoadingAddEntity={isPendingAdd}
          />
        }
      />
    </TabsContent>
  );
}
