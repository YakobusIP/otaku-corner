import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Loader2Icon } from "lucide-react";

type Props = {
  entityType: string;
  entityId: string;
  entity: string;
  editHandler: (id: string, entity: string) => void;
  isLoadingEditEntity: boolean;
};

export default function EditEntityDialog({
  entityType,
  entityId,
  entity,
  editHandler,
  isLoadingEditEntity
}: Props) {
  const [entityState, setEntityState] = useState(entity);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="float-right">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit {entityType}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder={`${entityType} name`}
          value={entityState}
          onChange={(e) => setEntityState(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={() => editHandler(entityId, entityState)}>
            {isLoadingEditEntity && (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            )}
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
