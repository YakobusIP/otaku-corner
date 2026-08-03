import {
  type ChangeEvent,
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from "react";

import ImageVaultCardBadges from "@/features/image-vault/components/ImageVaultCardBadges";
import ImageVaultOverallUploadProgress from "@/features/image-vault/components/ImageVaultOverallUploadProgress";
import ImageVaultPreviewImage from "@/features/image-vault/components/ImageVaultPreviewImage";
import ImageVaultPromptTextarea from "@/features/image-vault/components/ImageVaultPromptTextarea";
import ImageVaultSafetyFields from "@/features/image-vault/components/ImageVaultSafetyFields";
import {
  ImageVaultEntrySourceAssetsPreview,
  ImageVaultLocalSourceFilesPreview,
  resolveEntrySourceAssets
} from "@/features/image-vault/components/ImageVaultSourceAssetsPreview";
import ImageVaultUploadDialog from "@/features/image-vault/components/ImageVaultUploadDialog";
import {
  createImageVaultDetailFormValues,
  createImageVaultUploadDefaultValues,
  imageVaultUploadFormSchema
} from "@/features/image-vault/components/image-vault-upload-form.schema";
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
} from "@/features/image-vault/hooks/useImageVaultQueries";

import {
  type ImageOriginType,
  type ImageVaultEntry,
  type ImageVaultSafetyLevel,
  type ImageVaultSourceAsset,
  type SensitiveImageVisibility,
  IMAGE_VAULT_MAX_SOURCE_ASSETS_PER_ENTRY,
  isExplicitSafetyLevel,
  normalizeImageVaultSafetyReasonForSubmit,
  parseImageOriginType
} from "@/types/image-vault.type";

import {
  imageVaultImageDownloadPath,
  resolveImageVaultPreviewUrl
} from "@/features/image-vault/lib/image-vault-preview";
import { appendFilesUpToLimit } from "@/features/image-vault/lib/image-vault-source-files";
import {
  getSourceOverlay,
  type ImageVaultUploadStatus
} from "@/features/image-vault/lib/image-vault-upload-status";

import { useForm } from "@tanstack/react-form";
import { Loader2Icon, PlusIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react";

type Props = {
  imageId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sensitiveImageVisibility?: SensitiveImageVisibility;
};

const FORM_ID = "image-vault-detail-form";

function ImageVaultEditableSourceSection({
  image,
  sensitiveImageVisibility,
  keptSourceAssetIds,
  newSourceFiles,
  onKeptSourceAssetIdsChange,
  onNewSourceFilesChange,
  disabled,
  uploadStatus
}: {
  image: ImageVaultEntry;
  sensitiveImageVisibility: SensitiveImageVisibility;
  keptSourceAssetIds: string[];
  newSourceFiles: File[];
  onKeptSourceAssetIdsChange: (ids: string[]) => void;
  onNewSourceFilesChange: (files: File[]) => void;
  disabled?: boolean;
  uploadStatus?: ImageVaultUploadStatus | null;
}) {
  const isFollowUp = image.parentId != null;
  const { sourceAssets: lineageSources, fromLineage } =
    resolveEntrySourceAssets(image);

  const keptSourceAssets = useMemo(() => {
    const byId = new Map(image.sourceAssets.map((asset) => [asset.id, asset]));
    return keptSourceAssetIds
      .map((id) => byId.get(id))
      .filter((asset): asset is ImageVaultSourceAsset => asset != null);
  }, [image.sourceAssets, keptSourceAssetIds]);

  const totalSourceCount = keptSourceAssetIds.length + newSourceFiles.length;
  const remainingSlots =
    IMAGE_VAULT_MAX_SOURCE_ASSETS_PER_ENTRY - totalSourceCount;

  if (isFollowUp) {
    if (lineageSources.length === 0) return null;
    return (
      <div className="min-h-0 space-y-2 overflow-y-auto xl:min-h-0">
        <ImageVaultEntrySourceAssetsPreview
          entryId={image.id}
          sourceAssets={lineageSources}
          safetyLevel={image.safetyLevel}
          sensitiveImageVisibility={sensitiveImageVisibility}
          fromLineage={fromLineage}
        />
      </div>
    );
  }

  const handleAddSourceFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0 || remainingSlots <= 0) {
      event.target.value = "";
      return;
    }
    onNewSourceFilesChange(
      appendFilesUpToLimit(
        newSourceFiles,
        selected,
        IMAGE_VAULT_MAX_SOURCE_ASSETS_PER_ENTRY
      )
    );
    event.target.value = "";
  };

  return (
    <div className="min-h-0 space-y-3 overflow-y-auto rounded-md border border-border/60 p-3 xl:min-h-0">
      <div className="space-y-1">
        <FieldLabel htmlFor="detail-source-file">Source images</FieldLabel>
        <p className="text-xs text-muted-foreground">
          Up to {IMAGE_VAULT_MAX_SOURCE_ASSETS_PER_ENTRY} images.
          {totalSourceCount > 0 ? ` ${totalSourceCount} selected.` : null}
        </p>
      </div>

      {keptSourceAssets.length > 0 ? (
        <ImageVaultEntrySourceAssetsPreview
          entryId={image.id}
          sourceAssets={keptSourceAssets}
          safetyLevel={image.safetyLevel}
          sensitiveImageVisibility={sensitiveImageVisibility}
          title="Current sources"
          onRemove={
            disabled
              ? undefined
              : (assetId) =>
                  onKeptSourceAssetIdsChange(
                    keptSourceAssetIds.filter((id) => id !== assetId)
                  )
          }
          className="border-0 p-0"
        />
      ) : null}

      {newSourceFiles.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            New sources
          </p>
          <ImageVaultLocalSourceFilesPreview
            files={newSourceFiles}
            onRemove={
              disabled
                ? undefined
                : (index) =>
                    onNewSourceFilesChange(
                      newSourceFiles.filter(
                        (_, fileIndex) => fileIndex !== index
                      )
                    )
            }
            getOverlayLabel={(index) =>
              getSourceOverlay(uploadStatus, index)?.label
            }
          />
        </div>
      ) : null}

      <Input
        id="detail-source-file"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleAddSourceFiles}
        disabled={disabled || remainingSlots <= 0}
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
  const [keptSourceAssetIds, setKeptSourceAssetIds] = useState<string[]>([]);
  const [newSourceFiles, setNewSourceFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] =
    useState<ImageVaultUploadStatus | null>(null);

  const form = useForm({
    defaultValues: createImageVaultUploadDefaultValues(),
    validators: {
      onChange: imageVaultUploadFormSchema,
      onSubmit: imageVaultUploadFormSchema
    },
    onSubmit: async ({ value }) => {
      if (!viewImageId || !image) return;

      const isRootEntry = image.parentId == null;
      const originalSourceIds = image.sourceAssets.map((asset) => asset.id);
      const sourcesChanged =
        isRootEntry &&
        (newSourceFiles.length > 0 ||
          keptSourceAssetIds.length !== originalSourceIds.length ||
          keptSourceAssetIds.some(
            (id, index) => id !== originalSourceIds[index]
          ));

      try {
        await updateImage.mutateAsync({
          id: viewImageId,
          payload: {
            originType: value.originType,
            modelId:
              value.originType === "AI"
                ? value.modelId || image.model?.id || null
                : null,
            prompt: value.originType === "AI" ? value.prompt || null : null,
            originalPrompt: value.originalPrompt || null,
            sourceUrl: value.sourceUrl || null,
            categoryIds: value.categoryIds,
            notes: value.notes || null,
            safetyLevel: value.safetyLevel,
            safetyReason: normalizeImageVaultSafetyReasonForSubmit(
              value.safetyLevel,
              value.safetyReason
            ),
            ...(sourcesChanged
              ? { sourceAssetIds: keptSourceAssetIds }
              : {})
          },
          additionalSourceFiles: sourcesChanged ? newSourceFiles : undefined,
          onStatus: setUploadStatus
        });
        setNewSourceFiles([]);
      } finally {
        setUploadStatus(null);
      }
    }
  });

  useLayoutEffect(() => {
    if (!open || !image) return;
    const detailValues = createImageVaultDetailFormValues(image);
    form.reset(detailValues);
    form.setFieldValue("modelId", detailValues.modelId);
    setKeptSourceAssetIds(image.sourceAssets.map((asset) => asset.id));
    setNewSourceFiles([]);
    setUploadStatus(null);
  }, [form, image, open, viewImageId]);

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
  const activeModels = models.filter((model) => model.isActive);
  const detailModelOptions =
    image?.model && !activeModels.some((model) => model.id === image.model?.id)
      ? [image.model, ...activeModels]
      : activeModels;
  const isSaving = updateImage.isPending;

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
                  <ImageVaultEditableSourceSection
                    image={image}
                    sensitiveImageVisibility={sensitiveImageVisibility}
                    keptSourceAssetIds={keptSourceAssetIds}
                    newSourceFiles={newSourceFiles}
                    onKeptSourceAssetIdsChange={setKeptSourceAssetIds}
                    onNewSourceFilesChange={setNewSourceFiles}
                    disabled={isSaving}
                    uploadStatus={uploadStatus}
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
                        {(originType) => (
                          <Fragment>
                            <form.Field name="modelId">
                              {(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;
                                const selectedModelId =
                                  field.state.value || image.model?.id || "";
                                return (
                                  <Field
                                    className={
                                      originType === "AI" ? undefined : "hidden"
                                    }
                                    data-invalid={isInvalid}
                                  >
                                    <FieldLabel htmlFor="detail-model">
                                      Model
                                    </FieldLabel>
                                    <Select
                                      value={selectedModelId}
                                      onValueChange={field.handleChange}
                                    >
                                      <SelectTrigger
                                        id="detail-model"
                                        aria-invalid={isInvalid}
                                      >
                                        <SelectValue placeholder="Select model" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {detailModelOptions.map((model) => (
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
                            <form.Field name="sourceUrl">
                              {(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;
                                return (
                                  <Field
                                    className={
                                      originType === "HUMAN"
                                        ? undefined
                                        : "hidden"
                                    }
                                    data-invalid={isInvalid}
                                  >
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
                          </Fragment>
                        )}
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
                                  <ImageVaultPromptTextarea
                                    id="detail-prompt"
                                    label="Prompt"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={field.handleChange}
                                    isInvalid={isInvalid}
                                    errors={field.state.meta.errors}
                                  />
                                );
                              }}
                            </form.Field>
                            <form.Field name="originalPrompt">
                              {(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;
                                return (
                                  <ImageVaultPromptTextarea
                                    id="detail-original-prompt"
                                    label="Original prompt"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={field.handleChange}
                                    isInvalid={isInvalid}
                                    errors={field.state.meta.errors}
                                  />
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
                              isExplicitSafetyLevel(levelField.state.value) &&
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
                        className="gap-2"
                      >
                        <PlusIcon className="h-4 w-4" />
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

              <DialogFooter className="sticky bottom-0 flex-col gap-3 border-t bg-background pt-4 sm:space-x-0">
                {uploadStatus ? (
                  <ImageVaultOverallUploadProgress status={uploadStatus} />
                ) : null}
                <div className="flex w-full flex-row justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving || deleteImage.isPending}
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
                  disabled={deleteImage.isPending || isSaving}
                  className="h-10 w-10 shrink-0 px-0 md:w-auto md:px-4"
                >
                  {deleteImage.isPending ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2Icon className="h-4 w-4" />
                  )}
                  <span className="sr-only md:not-sr-only md:whitespace-nowrap">
                    Delete
                  </span>
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-10 w-10 shrink-0 px-0 md:w-auto md:px-4"
                >
                  {isSaving ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <SaveIcon className="h-4 w-4" />
                  )}
                  <span className="sr-only md:not-sr-only md:whitespace-nowrap">
                    Save changes
                  </span>
                </Button>
                </div>
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
