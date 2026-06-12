import axios from "axios";

import type {
  CreateImageEntryPayload,
  ImageOriginType,
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
    onProgress?: (percent: number) => void
  ): Promise<string> => {
    const mimeType = file.type?.trim();
    if (!mimeType) {
      throw new Error("File has no MIME type.");
    }

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
      const response = await interceptedAxios.get<
        PaginatedBody<ImageVaultEntry>
      >(`${BASE_URL}/images`, {
        params: {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
          originType: filters.originType,
          modelId: filters.modelId,
          categoryId: filters.categoryId,
          isExplicit:
            filters.isExplicit === undefined ? undefined : filters.isExplicit
        }
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
    metadata: Omit<CreateImageEntryPayload, "assetId" | "sourceAssetId">,
    options?: {
      sourceFile?: File | null;
      onProgress?: (percent: number) => void;
    }
  ): Promise<ServiceResult<ImageVaultEntry>> => {
    try {
      const assetId = await uploadPrivateVaultAsset(file, options?.onProgress);
      const sourceAssetId = options?.sourceFile
        ? await uploadPrivateVaultAsset(options.sourceFile)
        : undefined;

      const createResponse = await interceptedAxios.post<ImageVaultEntry>(
        `${BASE_URL}/images`,
        {
          assetId,
          ...(sourceAssetId ? { sourceAssetId } : {}),
          ...metadata
        }
      );
      return ok(createResponse.data);
    } catch (error: unknown) {
      return err(error);
    }
  };

  const updateImage = async (
    id: string,
    payload: UpdateImageEntryPayload
  ): Promise<ServiceResult<ImageVaultEntry>> => {
    try {
      const response = await interceptedAxios.patch<ImageVaultEntry>(
        `${BASE_URL}/images/${id}`,
        payload
      );
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

export type { ImageOriginType };
