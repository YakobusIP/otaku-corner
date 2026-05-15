import { type Dispatch, type SetStateAction, useCallback, useRef } from "react";

import { uploadService } from "@/services/upload.service";

import Progress from "@/components/ui/progress";

import type { MEDIA_TYPE } from "@/lib/enums";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const uploadResultToastDurationMs = 4000;

export const useReviewAssetUpload = (
  mediaType: MEDIA_TYPE,
  reviewId: number,
  setUploadedImages: Dispatch<SetStateAction<Record<string, string>>>
) => {
  const uploadToastIdRef = useRef<string | number | undefined>(undefined);
  const percentRef = useRef(0);
  const lastReportedPercentRef = useRef(-1);

  const reportProgress = useCallback((percent: number) => {
    const clamped = Math.min(100, Math.max(0, percent));
    const prev = lastReportedPercentRef.current;
    if (
      clamped === 100 ||
      prev < 0 ||
      clamped - prev >= 2 ||
      prev - clamped >= 2
    ) {
      lastReportedPercentRef.current = clamped;
      percentRef.current = clamped;
      const toastId = uploadToastIdRef.current;
      if (toastId === undefined) {
        return;
      }
      toast.loading("Uploading image…", {
        id: toastId,
        description: (
          <div className="flex w-full min-w-[300px] flex-col gap-2 pt-2">
            <Progress value={clamped} className="h-1" />
            <p className="text-xs text-muted-foreground">{clamped}%</p>
          </div>
        ),
        duration: Infinity
      });
    }
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const toastId = `review-upload-${reviewId}-${crypto.randomUUID()}`;
      uploadToastIdRef.current = toastId;
      lastReportedPercentRef.current = -1;
      percentRef.current = 0;
      toast.loading("Uploading image…", {
        id: toastId,
        description: (
          <div className="flex w-full min-w-[300px] flex-col gap-2 pt-2">
            <Progress value={0} className="h-1" />
            <p className="text-xs text-muted-foreground">0%</p>
          </div>
        ),
        duration: Infinity
      });

      const response = await uploadService.upload(
        file,
        mediaType,
        reviewId,
        reportProgress
      );
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      lastReportedPercentRef.current = -1;
      toast.success("Upload complete", {
        id: uploadToastIdRef.current,
        description: "Your image is uploaded successfully.",
        duration: uploadResultToastDurationMs
      });
      uploadToastIdRef.current = undefined;
    },
    onError: (error: Error) => {
      lastReportedPercentRef.current = -1;
      toast.error("Uh oh! Something went wrong", {
        id: uploadToastIdRef.current,
        description: error.message,
        duration: uploadResultToastDurationMs
      });
      uploadToastIdRef.current = undefined;
    }
  });

  const insertImage = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync(file);
      setUploadedImages((previous) => ({
        ...previous,
        [result.url]: result.id
      }));
      return result;
    } catch {
      return undefined;
    }
  };

  return {
    insertImage
  };
};
