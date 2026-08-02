import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { EditCategoryPayload } from "@/features/image-vault/hooks/useImageVaultCategoryManagement";

import type { ImageVaultCategory } from "@/types/image-vault.type";

import { cn } from "@/lib/utils";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon, PencilIcon, SaveIcon, XIcon } from "lucide-react";

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
  const form = useForm({
    defaultValues: {
      name: category.name,
      slug: category.slug
    },
    onSubmit: async ({ value }) => {
      const trimmedName = value.name.trim();
      const trimmedSlug = value.slug.trim();
      if (!trimmedName || !trimmedSlug) return;

      editHandler({
        id: category.id,
        name: trimmedName,
        slug: trimmedSlug.slice(0, 200)
      });
    }
  });

  useEffect(() => {
    form.reset({
      name: category.name,
      slug: category.slug
    });
  }, [category, form]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          form.reset({
            name: category.name,
            slug: category.slug
          });
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
          <Button variant="outline" size="sm" className="float-right gap-2">
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={cn("max-w-[400px]", "border-border/60")}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={`edit-category-name-${category.id}`}>
                    Name
                  </FieldLabel>
                  <Input
                    id={`edit-category-name-${category.id}`}
                    placeholder="Category name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    autoFocus
                  />
                </Field>
              )}
            </form.Field>
            <form.Field name="slug">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={`edit-category-slug-${category.id}`}>
                    Slug
                  </FieldLabel>
                  <Input
                    id={`edit-category-slug-${category.id}`}
                    placeholder="category-slug"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                  />
                </Field>
              )}
            </form.Field>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoadingEdit}
              className="gap-2"
            >
              <XIcon className="h-4 w-4" />
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.values.name, state.values.slug]}
            >
              {([name, slug]) => (
                <Button
                  type="submit"
                  disabled={
                    isLoadingEdit || !name.trim() || !slug.trim()
                  }
                  className="gap-2"
                >
                  {isLoadingEdit ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <SaveIcon className="h-4 w-4" />
                  )}
                  Save
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
