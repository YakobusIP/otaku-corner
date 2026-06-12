import { type Dispatch, type SetStateAction, useState } from "react";

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
import { Label } from "@/components/ui/label";

import { Loader2Icon, PlusIcon } from "lucide-react";

type Props = {
  isOpenDialog: boolean;
  setIsOpenDialog: Dispatch<SetStateAction<boolean>>;
  addHandler: (payload: { name: string; provider: string }) => void;
  isLoadingAdd: boolean;
};

export default function AddModelDialog({
  isOpenDialog,
  setIsOpenDialog,
  addHandler,
  isLoadingAdd
}: Props) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");

  const resetForm = () => {
    setName("");
    setProvider("");
  };

  const handleAdd = () => {
    const trimmedName = name.trim();
    const trimmedProvider = provider.trim();
    if (!trimmedName || !trimmedProvider) return;
    addHandler({ name: trimmedName, provider: trimmedProvider });
  };

  return (
    <Dialog
      open={isOpenDialog}
      onOpenChange={(open) => {
        setIsOpenDialog(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label="Add model"
          className="h-10 min-h-10 w-10 shrink-0 justify-center gap-2 border-border/60 bg-background/50 p-0 hover:bg-background/70 sm:h-9 sm:w-auto sm:justify-start sm:px-4 sm:py-2"
        >
          <PlusIcon className="h-4 w-4 shrink-0 text-[#A855F7]" aria-hidden />
          <span className="hidden sm:inline">Add Model</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] border-border/60">
        <DialogHeader>
          <DialogTitle>Add Model</DialogTitle>
          <DialogDescription>
            Add a new AI image generation model.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="add-model-name">Name</Label>
            <Input
              id="add-model-name"
              placeholder="Model name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-model-provider">Provider</Label>
            <Input
              id="add-model-provider"
              placeholder="Provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={
              isLoadingAdd || !name.trim() || !provider.trim()
            }
          >
            {isLoadingAdd ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : null}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
