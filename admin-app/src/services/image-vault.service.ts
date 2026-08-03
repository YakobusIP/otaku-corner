import axios from "axios";

import type {
  CreateImageEntryPayload,
  ImageVaultCategory,
  ImageVaultEntry,
  ImageVaultListFilters,
  ImageVaultModel,
  UpdateImageEntryPayload
} from "@/types/image-vault.type";
import type {
  PaginatedBody,
  PaginatedListPage,
  ServiceResult
} from "@/types/general.type";

import interceptedAxios from "@/lib/axios";
import type {
  ImageVaultAssetUploadStatus,
  ImageVaultUploadStatus
} from "@/features/image-vault/lib/image-vault-upload-status";
import {
  buildAssetStepStatus,
  buildSaveStepStatus,
  createImageVaultUploadStatusEmitter,
  getImageVaultCreateStepCount,
  getImageVaultUpdateSourceStepCount
} from "@/features/image-vault/lib/image-vault-upload-status";
import { err, ok } from "@/lib/service-result";
import { mapPaginatedBody } from "@/lib/utils";

const BASE_URL = "/api/image-vault";
const BASE_ASSETS_URL = "/api/assets";
const IMAGE_VAULT_STORAGE_DIRECTORY = "image-vault";

type InitAssetResponse = {
  assetId: string;
  uploadUrl: string;
  method: "PUT";
  headers?: Record<string, string>;
};

type CompleteAssetResponse = {
  assetId: string;
  status: string;
};

const createImageVaultService = () => {
  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  const uploadPrivateVaultAsset = async (
    file: File,
    options?: {
      onStatus?: (status: ImageVaultAssetUploadStatus) => void;
    }
  ): Promise<string> => {
    const mimeType = file.type?.trim();
    if (!mimeType) {
      throw new Error("File has no MIME type.");
    }

    options?.onStatus?.({ phase: "preparing" });

    const initResponse = await interceptedAxios.post<InitAssetResponse>(
      `${BASE_ASSETS_URL}/init`,
      {
        target: { kind: "IMAGE_VAULT" },
        mimeType,
        expectedFileSize: file.size,
        storageDirectory: IMAGE_VAULT_STORAGE_DIRECTORY
      }
    );

    const { assetId, uploadUrl, headers } = initResponse.data;
    const putHeaders = {
      "Content-Type": mimeType,
      ...(headers ?? {})
    };

    options?.onStatus?.({ phase: "uploading", percent: 0 });

    const putResponse = await axios.put(uploadUrl, file, {
      headers: putHeaders,
      onUploadProgress: (event) => {
        if (!options?.onStatus || !event.total) return;
        options.onStatus({
          phase: "uploading",
          percent: Math.round((event.loaded / event.total) * 100)
        });
      }
    });

    if (putResponse.status < 200 || putResponse.status >= 300) {
      throw new Error(`Upload failed (HTTP ${putResponse.status})`);
    }

    options?.onStatus?.({ phase: "finalizing" });

    const maxAttempts = 40;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await interceptedAxios.post<CompleteAssetResponse>(
          `${BASE_ASSETS_URL}/${assetId}/complete`
        );
        break;
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

    return assetId;
  };

  const listImages = async (
    filters: ImageVaultListFilters
  ): Promise<ServiceResult<PaginatedListPage<ImageVaultEntry>>> => {
    try {
      const response = await interceptedAxios.post<
        PaginatedBody<ImageVaultEntry>
      >(`${BASE_URL}/images/search`, {
        page: filters.page,
        limit: filters.limit,
        groups: filters.groups
      });
      return ok(mapPaginatedBody(response.data));
    } catch (error: unknown) {
      return err(error);
    }
  };

  const getImage = async (
    id: string
  ): Promise<ServiceResult<ImageVaultEntry>> => {
    try {
      const response = await interceptedAxios.get<ImageVaultEntry>(
        `${BASE_URL}/images/${id}`
      );
      return ok(response.data);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const uploadAndCreateImage = async (
    file: File,
    metadata: Omit<CreateImageEntryPayload, "assetId" | "sourceAssetIds">,
    options?: {
      sourceFiles?: File[];
      onStatus?: (status: ImageVaultUploadStatus) => void;
    }
  ): Promise<ServiceResult<ImageVaultEntry>> => {
    try {
      const sourceFiles = options?.sourceFiles ?? [];
      const stepCount = getImageVaultCreateStepCount(sourceFiles.length);
      const emit = createImageVaultUploadStatusEmitter(options?.onStatus);

      const assetId = await uploadPrivateVaultAsset(file, {
        onStatus: (assetStatus: ImageVaultAssetUploadStatus) => {
          const isPreparing = assetStatus.phase === "preparing";
          emit(
            buildAssetStepStatus({
              stepIndex: isPreparing ? 0 : 1,
              stepCount,
              label: isPreparing
                ? "Requesting upload URL..."
                : assetStatus.phase === "finalizing"
                  ? "Finalizing image upload..."
                  : "Uploading image...",
              target: { kind: "primary" },
              assetStatus
            })
          );
        }
      });

      const sourceAssetIds: string[] = [];
      for (let index = 0; index < sourceFiles.length; index += 1) {
        const sourceFile = sourceFiles[index];
        const stepIndex = 2 + index;
        const sourceAssetId = await uploadPrivateVaultAsset(sourceFile, {
          onStatus: (assetStatus) => {
            emit(
              buildAssetStepStatus({
                stepIndex,
                stepCount,
                label: `Uploading source ${index + 1} of ${sourceFiles.length}...`,
                target: { kind: "source", index },
                assetStatus
              })
            );
          }
        });
        sourceAssetIds.push(sourceAssetId);
      }

      const saveStepIndex = stepCount - 1;
      emit(
        buildSaveStepStatus({
          stepIndex: saveStepIndex,
          stepCount,
          label: "Saving to vault..."
        })
      );

      const createResponse = await interceptedAxios.post<ImageVaultEntry>(
        `${BASE_URL}/images`,
        {
          assetId,
          ...(sourceAssetIds.length > 0 ? { sourceAssetIds } : {}),
          ...metadata
        }
      );

      emit(
        buildSaveStepStatus({
          stepIndex: saveStepIndex,
          stepCount,
          label: "Saving to vault...",
          complete: true
        })
      );

      return ok(createResponse.data);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const updateImage = async (
    id: string,
    payload: UpdateImageEntryPayload,
    options?: {
      additionalSourceFiles?: File[];
      onStatus?: (status: ImageVaultUploadStatus) => void;
    }
  ): Promise<ServiceResult<ImageVaultEntry>> => {
    try {
      const additionalSourceFiles = options?.additionalSourceFiles ?? [];
      let sourceAssetIds = payload.sourceAssetIds;
      const trackProgress =
        additionalSourceFiles.length > 0 || sourceAssetIds !== undefined;
      const emit = trackProgress
        ? createImageVaultUploadStatusEmitter(options?.onStatus)
        : undefined;
      const stepCount = getImageVaultUpdateSourceStepCount(
        additionalSourceFiles.length
      );

      if (additionalSourceFiles.length > 0) {
        const uploadedSourceAssetIds: string[] = [];
        for (let index = 0; index < additionalSourceFiles.length; index += 1) {
          const sourceFile = additionalSourceFiles[index];
          const sourceAssetId = await uploadPrivateVaultAsset(sourceFile, {
            onStatus: (assetStatus) => {
              emit?.(
                buildAssetStepStatus({
                  stepIndex: index,
                  stepCount,
                  label: `Uploading source ${index + 1} of ${additionalSourceFiles.length}...`,
                  target: { kind: "source", index },
                  assetStatus
                })
              );
            }
          });
          uploadedSourceAssetIds.push(sourceAssetId);
        }
        sourceAssetIds = [
          ...(payload.sourceAssetIds ?? []),
          ...uploadedSourceAssetIds
        ];
      }

      const saveStepIndex = stepCount - 1;
      if (trackProgress) {
        emit?.(
          buildSaveStepStatus({
            stepIndex: saveStepIndex,
            stepCount,
            label: "Saving changes..."
          })
        );
      }

      const response = await interceptedAxios.patch<ImageVaultEntry>(
        `${BASE_URL}/images/${id}`,
        {
          ...payload,
          ...(sourceAssetIds !== undefined ? { sourceAssetIds } : {})
        }
      );

      if (trackProgress) {
        emit?.(
          buildSaveStepStatus({
            stepIndex: saveStepIndex,
            stepCount,
            label: "Saving changes...",
            complete: true
          })
        );
      }

      return ok(response.data);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const deleteImage = async (
    id: string
  ): Promise<ServiceResult<undefined>> => {
    try {
      await interceptedAxios.delete(`${BASE_URL}/images/${id}`);
      return ok(undefined);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const listModels = async (): Promise<ServiceResult<ImageVaultModel[]>> => {
    try {
      const response = await interceptedAxios.get<ImageVaultModel[]>(
        `${BASE_URL}/models`
      );
      return ok(response.data);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const createModel = async (payload: {
    name: string;
    provider: string;
    isActive?: boolean;
  }): Promise<ServiceResult<ImageVaultModel>> => {
    try {
      const response = await interceptedAxios.post<ImageVaultModel>(
        `${BASE_URL}/models`,
        payload
      );
      return ok(response.data);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const updateModel = async (
    id: string,
    payload: { name?: string; provider?: string; isActive?: boolean }
  ): Promise<ServiceResult<ImageVaultModel>> => {
    try {
      const response = await interceptedAxios.patch<ImageVaultModel>(
        `${BASE_URL}/models/${id}`,
        payload
      );
      return ok(response.data);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const deleteModels = async (
    ids: string[]
  ): Promise<ServiceResult<undefined>> => {
    try {
      await interceptedAxios.delete(`${BASE_URL}/models`, { data: { ids } });
      return ok(undefined);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const listCategories = async (): Promise<
    ServiceResult<ImageVaultCategory[]>
  > => {
    try {
      const response = await interceptedAxios.get<ImageVaultCategory[]>(
        `${BASE_URL}/categories`
      );
      return ok(response.data);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const createCategory = async (payload: {
    name: string;
    slug: string;
  }): Promise<ServiceResult<ImageVaultCategory>> => {
    try {
      const response = await interceptedAxios.post<ImageVaultCategory>(
        `${BASE_URL}/categories`,
        payload
      );
      return ok(response.data);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const updateCategory = async (
    id: string,
    payload: { name?: string; slug?: string }
  ): Promise<ServiceResult<ImageVaultCategory>> => {
    try {
      const response = await interceptedAxios.patch<ImageVaultCategory>(
        `${BASE_URL}/categories/${id}`,
        payload
      );
      return ok(response.data);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const deleteCategories = async (
    ids: string[]
  ): Promise<ServiceResult<undefined>> => {
    try {
      await interceptedAxios.delete(`${BASE_URL}/categories`, {
        data: { ids }
      });
      return ok(undefined);
    } catch (error: unknown) {
      return err(error);
    }
  };

  return {
    listImages,
    getImage,
    uploadAndCreateImage,
    updateImage,
    deleteImage,
    listModels,
    createModel,
    updateModel,
    deleteModels,
    listCategories,
    createCategory,
    updateCategory,
    deleteCategories
  };
};

export const imageVaultService = createImageVaultService();
