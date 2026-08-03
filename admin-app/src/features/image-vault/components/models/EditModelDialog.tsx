import { useEffect } from "react";

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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import type { EditModelPayload } from "@/features/image-vault/hooks/useImageVaultModelManagement";

import type { ImageVaultModel } from "@/types/image-vault.type";

import { cn } from "@/lib/utils";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon, PencilIcon, SaveIcon, XIcon } from "lucide-react";

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
  const form = useForm({
    defaultValues: {
      name: model.name,
      provider: model.provider,
      isActive: model.isActive
    },
    onSubmit: async ({ value }) => {
      const trimmedName = value.name.trim();
      const trimmedProvider = value.provider.trim();
      if (!trimmedName || !trimmedProvider) return;

      editHandler({
        id: model.id,
        name: trimmedName,
        provider: trimmedProvider,
        isActive: value.isActive
      });
    }
  });

  useEffect(() => {
    form.reset({
      name: model.name,
      provider: model.provider,
      isActive: model.isActive
    });
  }, [model, form]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          form.reset({
            name: model.name,
            provider: model.provider,
            isActive: model.isActive
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
            aria-label="Edit model"
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
            <DialogTitle>Edit Model</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={`edit-model-name-${model.id}`}>
                    Name
                  </FieldLabel>
                  <Input
                    id={`edit-model-name-${model.id}`}
                    placeholder="Model name"
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
            <form.Field name="provider">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={`edit-model-provider-${model.id}`}>
                    Provider
                  </FieldLabel>
                  <Input
                    id={`edit-model-provider-${model.id}`}
                    placeholder="Provider"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                  />
                </Field>
              )}
            </form.Field>
            <form.Field name="isActive">
              {(field) => (
                <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2">
                  <Checkbox
                    id={`edit-model-active-${model.id}`}
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                  />
                  <FieldLabel htmlFor={`edit-model-active-${model.id}`}>
                    Active
                  </FieldLabel>
                </div>
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
              selector={(state) => [
                state.values.name,
                state.values.provider
              ]}
            >
              {([name, provider]) => (
                <Button
                  type="submit"
                  disabled={
                    isLoadingEdit || !name.trim() || !provider.trim()
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
