import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { uploadService } from "@/services/upload.service";

import { extractUploadedImageMap } from "@/lib/utils";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2Icon, CloudIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

export type DetailReviewSaveStatusVariant =
  | "pending"
  | "dirty"
  | "saved"
  | "idle";

type MutationPayload<TData> = {
  currentImageIds: string[];
  reviewMarkdown: string;
  data: TData;
  snapshotAtSave: string;
  silent: boolean;
};

type SaveReviewResult = {
  success: boolean;
  error?: string;
  message?: string;
};

type UseDetailReviewAutosaveOptions<TData> = {
  entityId: number;
  detailQueryKey: readonly unknown[];
  snapshot: string;
  uploadedImages: Record<string, string>;
  setUploadedImages: Dispatch<SetStateAction<Record<string, string>>>;
  buildSavePayload: () => {
    currentImageIds: string[];
    reviewMarkdown: string;
    data: TData;
  };
  saveReview: (entityId: number, data: TData) => Promise<SaveReviewResult>;
  debounceMs?: number;
  onAfterInvalidateSuccess?: () => Promise<void>;
};

export const getDetailReviewSaveStatus = (params: {
  isPending: boolean;
  isDirty: boolean;
  lastSavedAt: Date | null;
}): { variant: DetailReviewSaveStatusVariant; tone: string; text: string } => {
  const { isPending, isDirty, lastSavedAt } = params;

  if (isPending) {
    return {
      variant: "pending",
      tone: "text-sky-300",
      text: "Saving..."
    };
  }

  if (isDirty) {
    return {
      variant: "dirty",
      tone: "text-amber-300",
      text: "Unsaved changes — autosave 5s after you stop editing"
    };
  }

  if (lastSavedAt) {
    return {
      variant: "saved",
      tone: "text-emerald-300",
      text: `Saved at ${lastSavedAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })}`
    };
  }

  return {
    variant: "idle",
    tone: "text-muted-foreground",
    text: "Autosave 5s after you stop editing"
  };
};

export type DetailReviewSaveStatus = ReturnType<
  typeof getDetailReviewSaveStatus
>;

export const buildDetailReviewSaveStatusDisplay = (
  saveStatus: DetailReviewSaveStatus
): { icon: ReactNode; text: string; tone: string } => {
  let icon: ReactNode;
  switch (saveStatus.variant) {
    case "pending":
      icon = <Loader2Icon className="h-4 w-4 animate-spin" />;
      break;
    case "dirty":
      icon = <CloudIcon className="h-4 w-4" />;
      break;
    case "saved":
      icon = <CheckCircle2Icon className="h-4 w-4" />;
      break;
    default:
      icon = <CloudIcon className="h-4 w-4" />;
  }

  return { icon, text: saveStatus.text, tone: saveStatus.tone };
};

export const useDetailReviewAutosave = <TData,>({
  entityId,
  detailQueryKey,
  snapshot,
  uploadedImages,
  setUploadedImages,
  buildSavePayload,
  saveReview,
  debounceMs = 5000,
  onAfterInvalidateSuccess
}: UseDetailReviewAutosaveOptions<TData>) => {
  const queryClient = useQueryClient();

  const savedSnapshotRef = useRef<string>(snapshot);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [debouncedSnapshot] = useDebounce(snapshot, debounceMs);

  const uploadedImagesRef = useRef(uploadedImages);
  uploadedImagesRef.current = uploadedImages;

  const buildSavePayloadRef = useRef(buildSavePayload);
  buildSavePayloadRef.current = buildSavePayload;

  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const updateReviewMutation = useMutation({
    mutationFn: async (payload: MutationPayload<TData>) => {
      const previouslyUploadedImageIds = Object.values(uploadedImagesRef.current);
      const removedImageIds = previouslyUploadedImageIds.filter(
        (id) => !payload.currentImageIds.includes(id)
      );

      const reviewResponse = await saveReview(entityId, payload.data);
      if (!reviewResponse.success) throw new Error(reviewResponse.error);

      const cleanupFailures: string[] = [];
      await Promise.all(
        removedImageIds.map(async (id) => {
          const response = await uploadService.remove(id);
          if (!response.success) {
            cleanupFailures.push(id);
          }
        })
      );

      if (cleanupFailures.length > 0 && import.meta.env.DEV) {
        console.warn(
          "[useDetailReviewAutosave] Failed to delete removed asset(s):",
          cleanupFailures
        );
      }

      return {
        message: reviewResponse.message,
        reviewMarkdown: payload.reviewMarkdown,
        snapshotAtSave: payload.snapshotAtSave,
        silent: payload.silent,
        cleanupFailures
      };
    },
    onSuccess: async ({
      message,
      reviewMarkdown,
      snapshotAtSave,
      silent,
      cleanupFailures
    }) => {
      savedSnapshotRef.current = snapshotAtSave;
      setLastSavedAt(new Date());
      await queryClient.invalidateQueries({ queryKey: detailQueryKey });
      if (onAfterInvalidateSuccess) {
        await onAfterInvalidateSuccess();
      }
      setUploadedImages(extractUploadedImageMap(reviewMarkdown));
      if (!silent) {
        const baseDescription =
          message ?? "Review saved successfully.";
        const cleanupNote =
          cleanupFailures.length > 0
            ? ` ${cleanupFailures.length} former image(s) could not be removed from storage yet; try saving again.`
            : "";
        toast.success("All set!", {
          description: baseDescription + cleanupNote
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Uh oh! Something went wrong", {
        description: error.message
      });
    }
  });

  const mutateRef = useRef(updateReviewMutation.mutate);
  mutateRef.current = updateReviewMutation.mutate;

  useEffect(() => {
    if (
      debouncedSnapshot !== savedSnapshotRef.current &&
      !updateReviewMutation.isPending
    ) {
      const { currentImageIds, data, reviewMarkdown } =
        buildSavePayloadRef.current();
      mutateRef.current({
        currentImageIds,
        data,
        reviewMarkdown,
        snapshotAtSave: debouncedSnapshot,
        silent: true
      });
    }
  }, [debouncedSnapshot, updateReviewMutation.isPending]);

  const handleSubmit = useCallback(() => {
    const { currentImageIds, data, reviewMarkdown } =
      buildSavePayloadRef.current();
    mutateRef.current({
      currentImageIds,
      data,
      reviewMarkdown,
      snapshotAtSave: snapshotRef.current,
      silent: false
    });
  }, []);

  const isDirty = snapshot !== savedSnapshotRef.current;

  const saveStatus = getDetailReviewSaveStatus({
    isPending: updateReviewMutation.isPending,
    isDirty,
    lastSavedAt
  });

  return {
    updateReviewMutation,
    handleSubmit,
    isDirty,
    lastSavedAt,
    saveStatus
  };
};
