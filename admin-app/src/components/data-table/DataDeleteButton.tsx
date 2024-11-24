import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { RowSelectionState } from "@tanstack/react-table";
import { Loader2Icon, Trash2Icon } from "lucide-react";

type Props = {
  rowSelection: RowSelectionState;
  deleteData: () => Promise<void>;
  isLoadingDeleteData: boolean;
};

export default function DataDeleteButton({
  rowSelection,
  deleteData,
  isLoadingDeleteData
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="flex items-center gap-2"
          disabled={Object.keys(rowSelection).length === 0}
        >
          <Trash2Icon className="w-4 h-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            selected data and remove them from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => deleteData()}>
            {isLoadingDeleteData && (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            )}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
