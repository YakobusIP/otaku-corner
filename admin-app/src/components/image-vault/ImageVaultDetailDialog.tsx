import { Fragment, useEffect, useState } from "react";

import ImageVaultCardBadges from "@/components/image-vault/ImageVaultCardBadges";
import ImageVaultPreviewImage from "@/components/image-vault/ImageVaultPreviewImage";
import ImageVaultSafetyFields from "@/components/image-vault/ImageVaultSafetyFields";
import ImageVaultUploadDialog from "@/components/image-vault/ImageVaultUploadDialog";
import {
  createImageVaultDetailFormValues,
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
  useImageVaultDetail,
  useImageVaultModels,
  useImageVaultMutations
} from "@/hooks/useImageVaultQueries";

import {
  type ImageOriginType,
  type ImageVaultEntry,
  type ImageVaultSafetyLevel,
  type SensitiveImageVisibility,
  normalizeImageVaultSafetyReasonForSubmit,
  parseImageOriginType
} from "@/types/image-vault.type";

import {
  imageVaultImageDownloadPath,
  imageVaultSourceDownloadPath,
  resolveImageVaultPreviewUrl
} from "@/lib/image-vault-preview";

import { useForm } from "@tanstack/react-form";
import { SaveIcon, Trash2Icon, XIcon } from "lucide-react";

type Props = {
  imageId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sensitiveImageVisibility?: SensitiveImageVisibility;
};

const FORM_ID = "image-vault-detail-form";

function ImageVaultSourcePreview({
  image,
  sensitiveImageVisibility
}: {
  image: ImageVaultEntry;
  sensitiveImageVisibility: SensitiveImageVisibility;
}) {
  const sourceAsset = image.sourceAsset ?? image.rootSourceAsset;
  if (!sourceAsset) return null;

  return (
    <div className="space-y-2 rounded-md border border-border/60 p-3 xl:grid xl:min-h-0 xl:grid-rows-[auto_minmax(0,1fr)]">
      <p className="text-xs font-medium text-muted-foreground">
        Source image
        {image.rootSourceAsset && !image.sourceAsset
          ? " (from lineage root)"
          : ""}
      </p>
      <ImageVaultPreviewImage
        src={resolveImageVaultPreviewUrl(
          sourceAsset.previewUrl,
          image.safetyLevel,
          sensitiveImageVisibility
        )}
        downloadUrl={imageVaultSourceDownloadPath(image.id)}
        alt="Source image"
        containerClassName="xl:min-h-0"
        className="max-h-48 xl:h-full xl:max-h-none"
      />
    </div>
  );
}

function RelatedImageButton({
  previewUrl,
  safetyLevel,
  sensitiveImageVisibility,
  label,
  onClick
}: {
  previewUrl: string;
  safetyLevel: ImageVaultSafetyLevel;
  sensitiveImageVisibility: SensitiveImageVisibility;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="h-auto w-full justify-start gap-3 p-2 text-left hover:border-primary/40 hover:bg-accent/30"
    >
      <img
        src={resolveImageVaultPreviewUrl(
          previewUrl,
          safetyLevel,
          sensitiveImageVisibility
        )}
        alt=""
        className="h-12 w-12 shrink-0 rounded object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </Button>
  );
}

export default function ImageVaultDetailDialog({
  imageId,
  open,
  onOpenChange,
  sensitiveImageVisibility = "MASK_EXPLICIT"
}: Props) {
  const [viewImageId, setViewImageId] = useState<string | null>(imageId);

  useEffect(() => {
    if (open) setViewImageId(imageId);
  }, [open, imageId]);

  const {
    data: image,
    isLoading,
    isError
  } = useImageVaultDetail(open ? viewImageId : null);
  const { data: models = [] } = useImageVaultModels(open);
  const { data: categories = [], isLoading: isLoadingCategories } =
    useImageVaultCategories(open);
  const { updateImage, deleteImage } = useImageVaultMutations();

  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [dialogContentElement, setDialogContentElement] =
    useState<HTMLDivElement | null>(null);

  const form = useForm({
    defaultValues: createImageVaultUploadDefaultValues(),
    validators: {
      onSubmit: imageVaultUploadFormSchema
    },
    onSubmit: async ({ value }) => {
      if (!viewImageId) return;

      await updateImage.mutateAsync({
        id: viewImageId,
        payload: {
          originType: value.originType,
          modelId: value.originType === "AI" ? value.modelId || null : null,
          prompt: value.originType === "AI" ? value.prompt || null : null,
          originalPrompt: value.originalPrompt || null,
          sourceUrl: value.sourceUrl || null,
          categoryIds: value.categoryIds,
          notes: value.notes || null,
          safetyLevel: value.safetyLevel,
          safetyReason: normalizeImageVaultSafetyReasonForSubmit(
            value.safetyLevel,
            value.safetyReason
          )
        }
      });
    }
  });

  useEffect(() => {
    if (!image) return;
    form.reset(createImageVaultDetailFormValues(image));
  }, [form, image]);

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

  const handleDelete = async () => {
    if (!viewImageId) return;
    await deleteImage.mutateAsync(viewImageId);
    onOpenChange(false);
  };

  const parentImage = image?.parent ?? null;
  const followUpImages = image?.children ?? [];

  return (
    <Fragment>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          ref={setDialogContentElement}
          className="flex max-h-[90vh] flex-col sm:max-w-2xl xl:h-[90vh] xl:max-w-6xl"
        >
          <DialogHeader>
            <DialogTitle>Image Detail</DialogTitle>
            <DialogDescription>
              Edit metadata, browse related images, or delete this vault entry.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : isError || !image ? (
            <p className="text-sm text-destructive">
              Could not load image detail.
            </p>
          ) : (
            <form
              id={FORM_ID}
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                void form.handleSubmit();
              }}
            >
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden pr-1 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(25rem,0.9fr)] xl:gap-6 xl:space-y-0 xl:overflow-hidden xl:pr-0">
                <div className="space-y-3 xl:grid xl:min-h-0 xl:grid-rows-[minmax(0,1.6fr)_minmax(0,1fr)_auto] xl:gap-3 xl:space-y-0 xl:overflow-hidden xl:pb-4">
                  <ImageVaultPreviewImage
                    src={resolveImageVaultPreviewUrl(
                      image.previewUrl,
                      image.safetyLevel,
                      sensitiveImageVisibility
                    )}
                    downloadUrl={imageVaultImageDownloadPath(image.id)}
                    containerClassName="xl:min-h-0"
                    className="xl:h-full xl:max-h-none"
                  />
                  <ImageVaultSourcePreview
                    image={image}
                    sensitiveImageVisibility={sensitiveImageVisibility}
                  />
                  <div className="xl:border-t xl:border-border/60 xl:pt-3">
                    <ImageVaultCardBadges
                      variant="detail"
                      originType={image.originType}
                      safetyLevel={image.safetyLevel}
                      categories={image.categories}
                      isFollowUp={image.parentId != null}
                      modelName={image.model?.name ?? null}
                    />
                  </div>
                </div>

                <div className="space-y-4 xl:min-h-0 xl:overflow-y-auto xl:overflow-x-hidden xl:pb-4 xl:pr-1">
                  <FieldGroup className="gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <form.Field name="originType">
                        {(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor="detail-origin-type">
                                Origin
                              </FieldLabel>
                              <Select
                                value={field.state.value}
                                onValueChange={(value) => {
                                  const nextOrigin =
                                    parseImageOriginType(value);
                                  if (!nextOrigin) return;
                                  handleOriginTypeChange(
                                    nextOrigin,
                                    field.handleChange
                                  );
                                }}
                              >
                                <SelectTrigger
                                  id="detail-origin-type"
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

                      <form.Subscribe
                        selector={(state) => state.values.originType}
                      >
                        {(originType) =>
                          originType === "AI" ? (
                            <form.Field name="modelId">
                              {(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor="detail-model">
                                      Model
                                    </FieldLabel>
                                    <Select
                                      value={field.state.value}
                                      onValueChange={field.handleChange}
                                    >
                                      <SelectTrigger
                                        id="detail-model"
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
                                              {model.name}
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
                                    <FieldLabel htmlFor="detail-source-url">
                                      Source URL
                                    </FieldLabel>
                                    <Input
                                      id="detail-source-url"
                                      type="url"
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(event) =>
                                        field.handleChange(event.target.value)
                                      }
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
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel>Categories</FieldLabel>
                            <MultiSelect
                              key={image.id}
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

                    <form.Subscribe
                      selector={(state) => state.values.originType}
                    >
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
                                    <FieldLabel htmlFor="detail-prompt">
                                      Prompt
                                    </FieldLabel>
                                    <Textarea
                                      id="detail-prompt"
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
                                    <FieldLabel htmlFor="detail-original-prompt">
                                      Original prompt
                                    </FieldLabel>
                                    <Textarea
                                      id="detail-original-prompt"
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
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor="detail-notes">
                              Notes
                            </FieldLabel>
                            <Textarea
                              id="detail-notes"
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
                                idPrefix="detail"
                                safetyLevel={levelField.state.value}
                                safetyReason={reasonField.state.value}
                                onSafetyLevelChange={levelField.handleChange}
                                onSafetyReasonChange={reasonField.handleChange}
                                safetyReasonInvalid={reasonInvalid}
                                safetyReasonErrors={
                                  reasonField.state.meta.errors
                                }
                              />
                            );
                          }}
                        </form.Field>
                      )}
                    </form.Field>
                  </FieldGroup>

                  <div className="space-y-3 border-t border-border/60 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">Related Images</h3>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setFollowUpOpen(true)}
                      >
                        Add follow-up
                      </Button>
                    </div>

                    {parentImage || followUpImages.length > 0 ? (
                      <div className="space-y-3">
                        {parentImage ? (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Parent
                            </p>
                            <RelatedImageButton
                              previewUrl={parentImage.previewUrl}
                              safetyLevel={parentImage.safetyLevel}
                              sensitiveImageVisibility={
                                sensitiveImageVisibility
                              }
                              label={parentImage.prompt || "Parent image"}
                              onClick={() => {
                                setViewImageId(parentImage.id);
                              }}
                            />
                          </div>
                        ) : null}

                        {followUpImages.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Follow-ups
                            </p>
                            <div className="grid gap-2 md:grid-cols-2">
                              {followUpImages.map((child) => (
                                <RelatedImageButton
                                  key={child.id}
                                  previewUrl={child.previewUrl}
                                  safetyLevel={child.safetyLevel}
                                  sensitiveImageVisibility={
                                    sensitiveImageVisibility
                                  }
                                  label={child.prompt || "Follow-up image"}
                                  onClick={() => setViewImageId(child.id)}
                                />
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No related images yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="sticky bottom-0 flex-row justify-end gap-2 border-t bg-background pt-4 sm:space-x-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateImage.isPending || deleteImage.isPending}
                  className="h-10 w-10 shrink-0 px-0 md:w-auto md:px-4"
                >
                  <XIcon className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:whitespace-nowrap">
                    Cancel
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteImage.isPending || updateImage.isPending}
                  className="h-10 w-10 shrink-0 px-0 md:w-auto md:px-4"
                >
                  <Trash2Icon className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:whitespace-nowrap">
                    Delete
                  </span>
                </Button>
                <Button
                  type="submit"
                  disabled={updateImage.isPending}
                  className="h-10 w-10 shrink-0 px-0 md:w-auto md:px-4"
                >
                  <SaveIcon className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:whitespace-nowrap">
                    {updateImage.isPending ? "Saving..." : "Save changes"}
                  </span>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {image ? (
        <ImageVaultUploadDialog
          open={followUpOpen}
          onOpenChange={setFollowUpOpen}
          parentImage={{
            id: image.id,
            previewUrl: image.previewUrl,
            prompt: image.prompt,
            safetyLevel: image.safetyLevel,
            safetyReason: image.safetyReason,
            modelId: image.model?.id,
            categoryIds: image.categories.map((category) => category.id)
          }}
          sensitiveImageVisibility={sensitiveImageVisibility}
        />
      ) : null}
    </Fragment>
  );
}
