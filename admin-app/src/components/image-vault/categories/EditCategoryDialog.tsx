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
import { Label } from "@/components/ui/label";

import type { EditCategoryPayload } from "@/hooks/useImageVaultCategoryManagement";

import type { ImageVaultCategory } from "@/types/image-vault.type";

import { cn } from "@/lib/utils";

import { Loader2Icon, PencilIcon } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ImageVaultCategory;
  editHandler: (payload: EditCategoryPayload) => void;
  isLoadingEdit: boolean;
  triggerVariant?: "button" | "icon";
};

export default function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  editHandler,
  isLoadingEdit,
  triggerVariant = "button"
}: Props) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);

  useEffect(() => {
    setName(category.name);
    setSlug(category.slug);
  }, [category]);

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedName || !trimmedSlug) return;

    editHandler({
      id: category.id,
      name: trimmedName,
      slug: trimmedSlug.slice(0, 200)
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setName(category.name);
          setSlug(category.slug);
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
            aria-label="Edit category"
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
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`edit-category-name-${category.id}`}>Name</Label>
            <Input
              id={`edit-category-name-${category.id}`}
              placeholder="Category name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`edit-category-slug-${category.id}`}>Slug</Label>
            <Input
              id={`edit-category-slug-${category.id}`}
              placeholder="category-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoadingEdit || !name.trim() || !slug.trim()}
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
