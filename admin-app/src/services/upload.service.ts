import axios from "axios";

import { MessageResponse } from "@/types/api.type";
import type { ServiceResult } from "@/types/general.type";
import { UploadImage } from "@/types/upload.type";

import interceptedAxios from "@/lib/axios";
import { MEDIA_TYPE } from "@/lib/enums";

import { err, ok } from "@/lib/service-result";

const BASE_ASSETS_URL = "/api/assets";
const REVIEW_IMAGE_STORAGE_DIRECTORY = "review-images";

type InitAssetResponse = {
  assetId: string;
  uploadUrl: string;
  method: "PUT";
  headers?: Record<string, string>;
};

type CompleteAssetResponse = {
  assetId: string;
  status: string;
  url: string;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const mapToReviewInitMediaType = (
  mediaType: string
): "ANIME" | "MANGA" | "LIGHT_NOVEL" => {
  switch (mediaType) {
    case MEDIA_TYPE.ANIME:
      return "ANIME";
    case MEDIA_TYPE.MANGA:
      return "MANGA";
    case MEDIA_TYPE.LIGHT_NOVEL:
      return "LIGHT_NOVEL";
    default:
      throw new Error(`Unsupported media type: ${mediaType}`);
  }
};

const uploadReviewImageViaAssets = async (
  file: File,
  mediaType: string,
  reviewId: number,
  onProgress?: (percent: number) => void
): Promise<UploadImage> => {
  const mimeType = file.type?.trim();
  if (!mimeType) {
    throw new Error(
      "This file has no MIME type; try saving as PNG/JPEG or paste again."
    );
  }

  const initResponse = await interceptedAxios.post<InitAssetResponse>(
    `${BASE_ASSETS_URL}/init`,
    {
      target: {
        kind: "REVIEW",
        mediaType: mapToReviewInitMediaType(mediaType),
        id: reviewId
      },
      mimeType,
      expectedFileSize: file.size,
      storageDirectory: REVIEW_IMAGE_STORAGE_DIRECTORY
    }
  );

  const { assetId, uploadUrl, headers } = initResponse.data;
  const putHeaders = {
    "Content-Type": mimeType,
    ...(headers ?? {})
  };

  const putResponse = await axios.put(uploadUrl, file, {
    headers: putHeaders,
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    }
  });

  if (putResponse.status < 200 || putResponse.status >= 300) {
    throw new Error(`Upload failed (HTTP ${putResponse.status})`);
  }

  const maxAttempts = 40;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const completeResponse = await interceptedAxios.post<CompleteAssetResponse>(
        `${BASE_ASSETS_URL}/${assetId}/complete`
      );
      return { id: assetId, url: completeResponse.data.url };
    } catch (error: unknown) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      if (status === 409 && attempt < maxAttempts - 1) {
        await sleep(350);
        continue;
      }
      throw error;
    }
  }

  throw new Error("Timed out waiting for upload to finalize.");
};

const createUploadService = () => {
  const upload = async (
    file: File,
    type: string,
    reviewId: number,
    onProgress?: (percent: number) => void
  ): Promise<ServiceResult<UploadImage>> => {
    try {
      const data = await uploadReviewImageViaAssets(
        file,
        type,
        reviewId,
        onProgress
      );
      return ok(data);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const remove = async (
    id: string
  ): Promise<ServiceResult<MessageResponse>> => {
    try {
      const response = await interceptedAxios.delete<MessageResponse>(
        `${BASE_ASSETS_URL}/${id}`
      );
      return ok({ message: response.data.message ?? "" });
    } catch (error: unknown) {
      return err(error);
    }
  };

  return { upload, remove };
};

export const uploadService = createUploadService();
