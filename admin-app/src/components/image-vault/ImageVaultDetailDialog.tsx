import { Fragment, useEffect, useState } from "react";

import ImageVaultPreviewImage from "@/components/image-vault/ImageVaultPreviewImage";
import ImageVaultUploadDialog from "@/components/image-vault/ImageVaultUploadDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import type {
  ImageOriginType,
  ImageVaultEntry
} from "@/types/image-vault.type";

import {
  imageVaultImageDownloadPath,
  imageVaultSourceDownloadPath,
  resolveImageVaultPreviewUrl
} from "@/lib/image-vault-preview";

import { Trash2Icon } from "lucide-react";

type Props = {
  imageId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hideExplicitImages?: boolean;
};

function ImageVaultSourcePreview({
  image,
  hideExplicitImages
}: {
  image: ImageVaultEntry;
  hideExplicitImages: boolean;
}) {
  const sourceAsset = image.sourceAsset ?? image.rootSourceAsset;
  if (!sourceAsset) return null;

  return (
    <div className="space-y-2 rounded-md border border-border/60 p-3">
      <p className="text-xs font-medium text-muted-foreground">
        Source image
        {image.rootSourceAsset && !image.sourceAsset
          ? " (from lineage root)"
          : ""}
      </p>
      <ImageVaultPreviewImage
        src={resolveImageVaultPreviewUrl(
          sourceAsset.previewUrl,
          image.isExplicit,
          hideExplicitImages
        )}
        downloadUrl={imageVaultSourceDownloadPath(image.id)}
        alt="Source image"
        className="max-h-48"
      />
    </div>
  );
}

export default function ImageVaultDetailDialog({
  imageId,
  open,
  onOpenChange,
  hideExplicitImages = false
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
  const [originType, setOriginType] = useState<ImageOriginType>("AI");
  const [modelId, setModelId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isExplicit, setIsExplicit] = useState(false);
  const [explicitReason, setExplicitReason] = useState("");

  useEffect(() => {
    if (!image) return;
    setOriginType(image.originType);
    setModelId(image.model?.id ?? "");
    setPrompt(image.prompt ?? "");
    setOriginalPrompt(image.originalPrompt ?? "");
    setSourceUrl(image.sourceUrl ?? "");
    setCategoryIds(image.categories.map((category) => category.id));
    setNotes(image.notes ?? "");
    setIsExplicit(image.isExplicit);
    setExplicitReason(image.explicitReason ?? "");
  }, [image]);

  const handleSave = async () => {
    if (!viewImageId) return;
    await updateImage.mutateAsync({
      id: viewImageId,
      payload: {
        originType,
        modelId: originType === "AI" ? modelId || null : null,
        prompt: originType === "AI" ? prompt || null : null,
        originalPrompt: originalPrompt || null,
        sourceUrl: sourceUrl || null,
        categoryIds,
        notes: notes || null,
        isExplicit,
        explicitReason: isExplicit ? explicitReason || null : null
      }
    });
  };

  const handleDelete = async () => {
    if (!viewImageId) return;
    await deleteImage.mutateAsync(viewImageId);
    onOpenChange(false);
  };

  return (
    <Fragment>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Image Detail</DialogTitle>
            <DialogDescription>
              Edit metadata, manage lineage, or delete this vault entry.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : isError || !image ? (
            <p className="text-sm text-destructive">
              Could not load image detail.
            </p>
          ) : (
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden pr-1">
              <div className="space-y-2">
                <ImageVaultPreviewImage
                  src={resolveImageVaultPreviewUrl(
                    image.previewUrl,
                    image.isExplicit,
                    hideExplicitImages
                  )}
                  downloadUrl={imageVaultImageDownloadPath(image.id)}
                />
                <ImageVaultSourcePreview
                  image={image}
                  hideExplicitImages={hideExplicitImages}
                />
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{image.originType}</Badge>
                  {image.model ? (
                    <Badge variant="secondary">{image.model.name}</Badge>
                  ) : null}
                  {image.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                  {image.isExplicit ? (
                    <Badge variant="destructive">Explicit</Badge>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Origin</Label>
                    <Select
                      value={originType}
                      onValueChange={(value) =>
                        setOriginType(value as ImageOriginType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AI">AI</SelectItem>
                        <SelectItem value="HUMAN">Human</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {originType === "AI" ? (
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select value={modelId} onValueChange={setModelId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="detail-source-url">Source URL</Label>
                      <Input
                        id="detail-source-url"
                        type="url"
                        value={sourceUrl}
                        onChange={(event) => setSourceUrl(event.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Categories</Label>
                  <MultiSelect
                    key={image.id}
                    modalPopover
                    options={categories.map((category) => ({
                      label: category.name,
                      value: category.id
                    }))}
                    defaultValue={categoryIds}
                    onValueChange={setCategoryIds}
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
                    disabled={isLoadingCategories || categories.length === 0}
                  />
                </div>

                {originType === "AI" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="detail-prompt">Prompt</Label>
                      <Textarea
                        id="detail-prompt"
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="detail-original-prompt">
                        Original prompt
                      </Label>
                      <Textarea
                        id="detail-original-prompt"
                        value={originalPrompt}
                        onChange={(event) =>
                          setOriginalPrompt(event.target.value)
                        }
                        rows={3}
                        className="min-h-[60px]"
                      />
                    </div>
                  </>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="detail-notes">Notes</Label>
                  <Textarea
                    id="detail-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={2}
                    className="min-h-[60px]"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2">
                  <Checkbox
                    id="detail-explicit"
                    checked={isExplicit}
                    onCheckedChange={(checked) =>
                      setIsExplicit(checked === true)
                    }
                  />
                  <Label htmlFor="detail-explicit">Explicit</Label>
                </div>

                {isExplicit ? (
                  <div className="space-y-2">
                    <Label htmlFor="detail-explicit-reason">
                      Explicit reason
                    </Label>
                    <Input
                      id="detail-explicit-reason"
                      value={explicitReason}
                      onChange={(event) =>
                        setExplicitReason(event.target.value)
                      }
                    />
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={updateImage.isPending}
                  >
                    Save changes
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteImage.isPending}
                  >
                    <Trash2Icon className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-3 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Lineage</h3>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setFollowUpOpen(true)}
                  >
                    Add follow-up
                  </Button>
                </div>

                {image.parent ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Parent
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setViewImageId(image.parent!.id)}
                      className="h-auto w-full justify-start gap-3 p-2 text-left hover:border-primary/40 hover:bg-accent/30"
                    >
                      <img
                        src={resolveImageVaultPreviewUrl(
                          image.parent.previewUrl,
                          image.parent.isExplicit,
                          hideExplicitImages
                        )}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-muted-foreground">
                          {image.parent.prompt || "Parent image"}
                        </p>
                      </div>
                    </Button>
                  </div>
                ) : null}

                {image.children && image.children.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Children
                    </p>
                    {image.children.map((child) => (
                      <Button
                        key={child.id}
                        type="button"
                        variant="outline"
                        onClick={() => setViewImageId(child.id)}
                        className="h-auto w-full justify-start gap-3 p-2 text-left hover:border-primary/40 hover:bg-accent/30"
                      >
                        <img
                          src={resolveImageVaultPreviewUrl(
                            child.previewUrl,
                            child.isExplicit,
                            hideExplicitImages
                          )}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-muted-foreground">
                            {child.prompt || "Follow-up image"}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
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
            isExplicit: image.isExplicit,
            categoryIds: image.categories.map((category) => category.id)
          }}
          hideExplicitImages={hideExplicitImages}
        />
      ) : null}
    </Fragment>
  );
}
