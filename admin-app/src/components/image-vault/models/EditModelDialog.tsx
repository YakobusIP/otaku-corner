import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { EditModelPayload } from "@/hooks/useImageVaultModelManagement";

import type { ImageVaultModel } from "@/types/image-vault.type";

import { cn } from "@/lib/utils";

import { Loader2Icon, PencilIcon } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: ImageVaultModel;
  editHandler: (payload: EditModelPayload) => void;
  isLoadingEdit: boolean;
  triggerVariant?: "button" | "icon";
};

export default function EditModelDialog({
  open,
  onOpenChange,
  model,
  editHandler,
  isLoadingEdit,
  triggerVariant = "button"
}: Props) {
  const [name, setName] = useState(model.name);
  const [provider, setProvider] = useState(model.provider);
  const [isActive, setIsActive] = useState(model.isActive);

  useEffect(() => {
    setName(model.name);
    setProvider(model.provider);
    setIsActive(model.isActive);
  }, [model]);

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedProvider = provider.trim();
    if (!trimmedName || !trimmedProvider) return;

    editHandler({
      id: model.id,
      name: trimmedName,
      provider: trimmedProvider,
      isActive
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setName(model.name);
          setProvider(model.provider);
          setIsActive(model.isActive);
        }
      }}
    >
      <DialogTrigger asChild>
        {triggerVariant === "icon" ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 border-border/60 bg-background/40"
            aria-label="Edit model"
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
          <DialogTitle>Edit Model</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`edit-model-name-${model.id}`}>Name</Label>
            <Input
              id={`edit-model-name-${model.id}`}
              placeholder="Model name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-model-provider-${model.id}`}>Provider</Label>
            <Input
              id={`edit-model-provider-${model.id}`}
              placeholder="Provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2">
            <Checkbox
              id={`edit-model-active-${model.id}`}
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label htmlFor={`edit-model-active-${model.id}`}>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoadingEdit || !name.trim() || !provider.trim()}
          >
            {isLoadingEdit ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
