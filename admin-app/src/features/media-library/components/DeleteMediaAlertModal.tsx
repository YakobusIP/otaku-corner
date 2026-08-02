import { Fragment } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { Loader2Icon, Trash2Icon, XIcon } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTitle: string | null;
  onConfirm: () => void;
  isDeleting: boolean;
};

const DeleteMediaAlertModal = ({
  open,
  onOpenChange,
  itemTitle,
  onConfirm,
  isDeleting
}: Props) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            {itemTitle ? (
              <Fragment>
                &quot;{itemTitle}&quot; will be permanently removed. This action
                cannot be undone.
              </Fragment>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="gap-2">
            <XIcon className="h-4 w-4" />
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2Icon className="h-4 w-4" />
            )}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMediaAlertModal;
