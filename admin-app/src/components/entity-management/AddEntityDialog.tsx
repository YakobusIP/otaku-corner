import { Dispatch, SetStateAction, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Loader2Icon, PlusIcon } from "lucide-react";

type Props = {
  isOpenDialog: boolean;
  setIsOpenDialog: Dispatch<SetStateAction<boolean>>;
  entityType: string;
  addHandler: (entity: string) => void;
  isLoadingAddEntity: boolean;
};

export default function AddEntityDialog({
  isOpenDialog,
  setIsOpenDialog,
  entityType,
  addHandler,
  isLoadingAddEntity
}: Props) {
  const [entity, setEntity] = useState("");

  return (
    <Dialog
      open={isOpenDialog}
      onOpenChange={(open) => {
        setIsOpenDialog(open);
        if (!open) setEntity("");
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={`Add ${entityType}`}
          className="h-10 min-h-10 w-10 shrink-0 justify-center gap-2 border-border/60 bg-background/50 p-0 hover:bg-background/70 sm:h-9 sm:w-auto sm:justify-start sm:px-4 sm:py-2"
        >
          <PlusIcon className="h-4 w-4 shrink-0 text-[#A855F7]" aria-hidden />
          <span className="hidden sm:inline">{`Add ${entityType}`}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] border-border/60">
        <DialogHeader>
          <DialogTitle>Add {entityType}</DialogTitle>
          <DialogDescription>
            Add a new {entityType.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder={`${entityType} name`}
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={() => addHandler(entity)}>
            {isLoadingAddEntity && (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            )}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
