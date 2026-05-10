import { useEffect, useState } from "react";

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

import { cn } from "@/lib/utils";

import { Loader2Icon, PencilIcon } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: number;
  entity: string;
  editHandler: (id: number, entity: string) => void;
  isLoadingEditEntity: boolean;
  triggerVariant?: "button" | "icon";
};

export default function EditEntityDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  entity,
  editHandler,
  isLoadingEditEntity,
  triggerVariant = "button"
}: Props) {
  const [entityState, setEntityState] = useState(entity);

  useEffect(() => {
    setEntityState(entity);
  }, [entity]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setEntityState(entity);
      }}
    >
      <DialogTrigger asChild>
        {triggerVariant === "icon" ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 border-border/60 bg-background/40"
            aria-label={`Edit ${entityType}`}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="float-right">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={cn("max-w-[400px]", "border-border/60")}>
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
              <Loader2Icon className="h-4 w-4 animate-spin" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
