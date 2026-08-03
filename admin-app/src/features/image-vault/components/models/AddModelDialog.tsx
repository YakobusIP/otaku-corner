import { type Dispatch, type SetStateAction } from "react";

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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon, PlusIcon, XIcon } from "lucide-react";

type Props = {
  isOpenDialog: boolean;
  setIsOpenDialog: Dispatch<SetStateAction<boolean>>;
  addHandler: (payload: { name: string; provider: string }) => void;
  isLoadingAdd: boolean;
};

const DEFAULT_VALUES = {
  name: "",
  provider: ""
};

export default function AddModelDialog({
  isOpenDialog,
  setIsOpenDialog,
  addHandler,
  isLoadingAdd
}: Props) {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      const trimmedName = value.name.trim();
      const trimmedProvider = value.provider.trim();
      if (!trimmedName || !trimmedProvider) return;
      addHandler({ name: trimmedName, provider: trimmedProvider });
    }
  });

  const resetForm = () => {
    form.reset(DEFAULT_VALUES);
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
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Add Model</DialogTitle>
            <DialogDescription>
              Add a new AI image generation model.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="add-model-name">Name</FieldLabel>
                  <Input
                    id="add-model-name"
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
                  <FieldLabel htmlFor="add-model-provider">Provider</FieldLabel>
                  <Input
                    id="add-model-provider"
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
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpenDialog(false)}
              disabled={isLoadingAdd}
              className="gap-2"
            >
              <XIcon className="h-4 w-4" />
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.values.name, state.values.provider]}
            >
              {([name, provider]) => (
                <Button
                  type="submit"
                  disabled={
                    isLoadingAdd || !name.trim() || !provider.trim()
                  }
                  className="gap-2"
                >
                  {isLoadingAdd ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlusIcon className="h-4 w-4" />
                  )}
                  Add
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
