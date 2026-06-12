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

import { generateSlug } from "@/lib/utils";

import { Loader2Icon, PlusIcon } from "lucide-react";

type Props = {
  isOpenDialog: boolean;
  setIsOpenDialog: Dispatch<SetStateAction<boolean>>;
  addHandler: (payload: { name: string; slug: string }) => void;
  isLoadingAdd: boolean;
};

export default function AddCategoryDialog({
  isOpenDialog,
  setIsOpenDialog,
  addHandler,
  isLoadingAdd
}: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const resetForm = () => {
    setName("");
    setSlug("");
  };

  const handleAdd = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const resolvedSlug =
      slug.trim() || generateSlug(trimmedName) || "category";

    addHandler({
      name: trimmedName,
      slug: resolvedSlug.slice(0, 200)
    });
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
          aria-label="Add category"
          className="h-10 min-h-10 w-10 shrink-0 justify-center gap-2 border-border/60 bg-background/50 p-0 hover:bg-background/70 sm:h-9 sm:w-auto sm:justify-start sm:px-4 sm:py-2"
        >
          <PlusIcon className="h-4 w-4 shrink-0 text-[#A855F7]" aria-hidden />
          <span className="hidden sm:inline">Add Category</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[400px] border-border/60">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Add a reusable category for vault images.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="add-category-name">Name</Label>
            <Input
              id="add-category-name"
              placeholder="Category name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-category-slug">Slug (optional)</Label>
            <Input
              id="add-category-slug"
              placeholder="category-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={isLoadingAdd || !name.trim()}
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
