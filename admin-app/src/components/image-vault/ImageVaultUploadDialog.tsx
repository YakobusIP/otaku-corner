import {
  type ChangeEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import ImageVaultSafetyFields from "@/components/image-vault/ImageVaultSafetyFields";
import {
  type ImageVaultUploadParentDefaults,
  createImageVaultUploadDefaultValues,
  imageVaultUploadFormSchema
} from "@/components/image-vault/image-vault-upload-form.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  useImageVaultCategories,
  useImageVaultModels,
  useImageVaultMutations
} from "@/hooks/useImageVaultQueries";

import {
  type ImageOriginType,
  type SensitiveImageVisibility,
  normalizeImageVaultSafetyReasonForSubmit,
  parseImageOriginType
} from "@/types/image-vault.type";

import { resolveImageVaultPreviewUrl } from "@/lib/image-vault-preview";

import { useForm } from "@tanstack/react-form";
import { UploadIcon, XIcon } from "lucide-react";

type ParentImage = ImageVaultUploadParentDefaults & {
  id: string;
  previewUrl: string;
  prompt?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentImage?: ParentImage | null;
  sensitiveImageVisibility?: SensitiveImageVisibility;
};

const FORM_ID = "image-vault-upload-form";

export default function ImageVaultUploadDialog({
  open,
  onOpenChange,
  parentImage = null,
  sensitiveImageVisibility = "MASK_EXPLICIT"
}: Props) {
  const isFollowUp = Boolean(parentImage);

  const parentDefaults = useMemo((): ImageVaultUploadParentDefaults => {
    if (!parentImage) {
      return {};
    }
    const { categoryIds, modelId, safetyLevel, safetyReason } = parentImage;
    return { categoryIds, modelId, safetyLevel, safetyReason };
  }, [parentImage]);

  const { data: models = [] } = useImageVaultModels(open);
  const { data: categories = [], isLoading: isLoadingCategories } =
    useImageVaultCategories(open);
  const { uploadImage } = useImageVaultMutations();

  const [file, setFile] = useState<File | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dialogContentElement, setDialogContentElement] =
    useState<HTMLDivElement | null>(null);

  const form = useForm({
    defaultValues: createImageVaultUploadDefaultValues(parentDefaults),
    validators: {
      onSubmit: imageVaultUploadFormSchema
    },
    onSubmit: async ({ value }) => {
      if (!file) {
        setFileError("Image file is required.");
        return;
      }

      setFileError(null);

      await uploadImage.mutateAsync({
        file,
        sourceFile: isFollowUp ? null : sourceFile,
        metadata: {
          parentId: parentImage?.id,
          originType: value.originType,
          modelId: value.originType === "AI" ? value.modelId : undefined,
          prompt: value.originType === "AI" ? value.prompt : undefined,
          originalPrompt: value.originalPrompt || undefined,
          sourceUrl: value.sourceUrl || undefined,
          categoryIds:
            value.categoryIds.length > 0 ? value.categoryIds : undefined,
          notes: value.notes || undefined,
          safetyLevel: value.safetyLevel,
          safetyReason: normalizeImageVaultSafetyReasonForSubmit(
            value.safetyLevel,
            value.safetyReason
          )
        },
        onProgress: setUploadProgress
      });

      resetDialogState();
      onOpenChange(false);
    }
  });

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );
  const sourcePreviewUrl = useMemo(
    () => (sourceFile ? URL.createObjectURL(sourceFile) : null),
    [sourceFile]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (sourcePreviewUrl) URL.revokeObjectURL(sourcePreviewUrl);
    };
  }, [previewUrl, sourcePreviewUrl]);

  const resetDialogState = useCallback(() => {
    form.reset(createImageVaultUploadDefaultValues(parentDefaults));
    setFile(null);
    setSourceFile(null);
    setFileError(null);
    setUploadProgress(null);
  }, [form, parentDefaults]);

  useEffect(() => {
    if (!open) return;
    resetDialogState();
  }, [open, resetDialogState]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    if (next) {
      setFileError(null);
    }
  };

  const handleSourceFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    setSourceFile(next);
  };

  const handleOriginTypeChange = (
    nextOriginType: ImageOriginType,
    handleChange: (value: ImageOriginType) => void
  ) => {
    handleChange(nextOriginType);
    if (nextOriginType === "HUMAN") {
      form.setFieldValue("modelId", "");
      form.setFieldValue("prompt", "");
      form.setFieldValue("originalPrompt", "");
      return;
    }
    form.setFieldValue("sourceUrl", "");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetDialogState();
        onOpenChange(next);
      }}
    >
      <DialogContent
        ref={setDialogContentElement}
        className="flex max-h-[90vh] flex-col sm:max-w-lg xl:h-[90vh] xl:max-w-5xl"
      >
        <DialogHeader>
          <DialogTitle>
            {isFollowUp ? "Add Follow-up" : "Upload Image"}
          </DialogTitle>
          <DialogDescription>
            {isFollowUp
              ? "Upload a follow-up image linked to the parent entry."
              : "Add an image to the private vault."}
          </DialogDescription>
        </DialogHeader>

        <form
          id={FORM_ID}
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden pr-1 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)] xl:gap-6 xl:space-y-0 xl:overflow-hidden xl:pr-0">
            <div className="space-y-4 xl:min-h-0 xl:overflow-hidden xl:pb-3">
              {isFollowUp && parentImage ? (
                <div className="space-y-2 rounded-md border border-border/60 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Parent image
                  </p>
                  <img
                    src={resolveImageVaultPreviewUrl(
                      parentImage.previewUrl,
                      parentImage.safetyLevel ?? "SAFE",
                      sensitiveImageVisibility
                    )}
                    alt=""
                    className="max-h-40 w-full rounded-md border border-border/60 object-contain bg-muted/20 xl:max-h-[24vh]"
                  />
                  {parentImage.prompt ? (
                    <p className="line-clamp-3 text-xs text-muted-foreground">
                      {parentImage.prompt}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <Field data-invalid={Boolean(fileError)}>
                <FieldLabel htmlFor="vault-file">Image file</FieldLabel>
                <Input
                  id="vault-file"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  aria-invalid={Boolean(fileError)}
                />
                {fileError ? <FieldError>{fileError}</FieldError> : null}
                {previewUrl ? (
                  <div className="overflow-hidden rounded-md border border-border/60 bg-muted/20">
                    <img
                      src={previewUrl}
                      alt="Selected upload preview"
                      className="max-h-64 w-full object-contain xl:max-h-[38vh]"
                    />
                  </div>
                ) : null}
              </Field>

              {!isFollowUp ? (
                <Field>
                  <FieldLabel htmlFor="vault-source-file">
                    Source image (optional)
                  </FieldLabel>
                  <Input
                    id="vault-source-file"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleSourceFileChange}
                  />
                  {sourcePreviewUrl ? (
                    <div className="overflow-hidden rounded-md border border-border/60 bg-muted/20">
                      <img
                        src={sourcePreviewUrl}
                        alt="Selected source image preview"
                        className="max-h-48 w-full object-contain xl:max-h-[24vh]"
                      />
                    </div>
                  ) : null}
                </Field>
              ) : null}
            </div>

            <div className="space-y-4 xl:min-h-0 xl:overflow-y-auto xl:overflow-x-hidden xl:pb-4 xl:pr-1">
              <FieldGroup className="gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <form.Field name="originType">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor="vault-origin-type">
                            Origin
                          </FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => {
                              const nextOrigin = parseImageOriginType(value);
                              if (!nextOrigin) return;
                              handleOriginTypeChange(
                                nextOrigin,
                                field.handleChange
                              );
                            }}
                          >
                            <SelectTrigger
                              id="vault-origin-type"
                              aria-invalid={isInvalid}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AI">AI</SelectItem>
                              <SelectItem value="HUMAN">Human</SelectItem>
                            </SelectContent>
                          </Select>
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : null}
                        </Field>
                      );
                    }}
                  </form.Field>

                  <form.Subscribe selector={(state) => state.values.originType}>
                    {(originType) =>
                      originType === "AI" ? (
                        <form.Field name="modelId">
                          {(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor="vault-model">
                                  Model
                                </FieldLabel>
                                <Select
                                  value={field.state.value}
                                  onValueChange={field.handleChange}
                                >
                                  <SelectTrigger
                                    id="vault-model"
                                    aria-invalid={isInvalid}
                                  >
                                    <SelectValue placeholder="Select model" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {models
                                      .filter((model) => model.isActive)
                                      .map((model) => (
                                        <SelectItem
                                          key={model.id}
                                          value={model.id}
                                        >
                                          {model.name} ({model.provider})
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                {isInvalid ? (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
                                ) : null}
                              </Field>
                            );
                          }}
                        </form.Field>
                      ) : (
                        <form.Field name="sourceUrl">
                          {(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor="vault-source-url">
                                  Source URL (optional)
                                </FieldLabel>
                                <Input
                                  id="vault-source-url"
                                  type="url"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  placeholder="https://..."
                                  aria-invalid={isInvalid}
                                />
                                {isInvalid ? (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
                                ) : null}
                              </Field>
                            );
                          }}
                        </form.Field>
                      )
                    }
                  </form.Subscribe>
                </div>

                <form.Field name="categoryIds">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel>Categories</FieldLabel>
                        <MultiSelect
                          key={`${parentImage?.id ?? "root"}-${open ? "open" : "closed"}`}
                          options={categories.map((category) => ({
                            label: category.name,
                            value: category.id
                          }))}
                          defaultValue={field.state.value}
                          onValueChange={field.handleChange}
                          placeholder={
                            isLoadingCategories
                              ? "Fetching categories..."
                              : categories.length === 0
                                ? "No categories available"
                                : "Select categories"
                          }
                          maxCount={3}
                          responsive={{
                            smallMobile: { maxCount: 1, compactMode: true },
                            mobile: { maxCount: 2, compactMode: true },
                            tablet: { maxCount: 3 },
                            desktop: { maxCount: 3 }
                          }}
                          searchable
                          hideSelectAll
                          className="w-full"
                          popoverPortalContainer={dialogContentElement}
                          disabled={
                            isLoadingCategories || categories.length === 0
                          }
                        />
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : null}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Subscribe selector={(state) => state.values.originType}>
                  {(originType) =>
                    originType === "AI" ? (
                      <Fragment>
                        <form.Field name="prompt">
                          {(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor="vault-prompt">
                                  {isFollowUp ? "Follow-up prompt" : "Prompt"}
                                </FieldLabel>
                                <Textarea
                                  id="vault-prompt"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  rows={4}
                                  aria-invalid={isInvalid}
                                />
                                {isInvalid ? (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
                                ) : null}
                              </Field>
                            );
                          }}
                        </form.Field>
                        <form.Field name="originalPrompt">
                          {(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor="vault-original-prompt">
                                  Original prompt (optional)
                                </FieldLabel>
                                <Textarea
                                  id="vault-original-prompt"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(event.target.value)
                                  }
                                  rows={3}
                                  className="min-h-[60px]"
                                  aria-invalid={isInvalid}
                                />
                                {isInvalid ? (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
                                ) : null}
                              </Field>
                            );
                          }}
                        </form.Field>
                      </Fragment>
                    ) : null
                  }
                </form.Subscribe>

                <form.Field name="notes">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor="vault-notes">Notes</FieldLabel>
                        <Textarea
                          id="vault-notes"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          rows={2}
                          className="min-h-[60px]"
                          aria-invalid={isInvalid}
                        />
                        {isInvalid ? (
                          <FieldError errors={field.state.meta.errors} />
                        ) : null}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="safetyLevel">
                  {(levelField) => (
                    <form.Field name="safetyReason">
                      {(reasonField) => {
                        const reasonInvalid =
                          reasonField.state.meta.isTouched &&
                          !reasonField.state.meta.isValid;
                        return (
                          <ImageVaultSafetyFields
                            safetyLevel={levelField.state.value}
                            safetyReason={reasonField.state.value}
                            onSafetyLevelChange={levelField.handleChange}
                            onSafetyReasonChange={reasonField.handleChange}
                            safetyReasonInvalid={reasonInvalid}
                            safetyReasonErrors={reasonField.state.meta.errors}
                          />
                        );
                      }}
                    </form.Field>
                  )}
                </form.Field>
              </FieldGroup>

              {uploadProgress !== null ? (
                <p className="text-sm text-muted-foreground">
                  Uploading: {uploadProgress}%
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 flex-row justify-end gap-2 border-t bg-background pt-4 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploadImage.isPending}
              className="h-10 w-10 shrink-0 px-0 md:w-32 md:px-4"
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:whitespace-nowrap">
                Cancel
              </span>
            </Button>
            <Button
              type="submit"
              disabled={!file || uploadImage.isPending}
              className="h-10 w-10 shrink-0 px-0 md:w-32 md:px-4"
            >
              <UploadIcon className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:whitespace-nowrap">
                {uploadImage.isPending ? "Uploading..." : "Upload"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
