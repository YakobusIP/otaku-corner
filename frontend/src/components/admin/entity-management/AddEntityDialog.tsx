import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

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
    <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" className="float-right w-full lg:w-fit">
          Add {entityType}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px]">
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
