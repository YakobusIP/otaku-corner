import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { imageVaultService } from "@/services/image-vault.service";

import type {
  CreateImageEntryPayload,
  UpdateImageEntryPayload
} from "@/types/image-vault.type";

import { handleAxiosError } from "@/lib/axios";
import { imageVaultKeys } from "@/lib/query-keys";

export const useImageVaultDetail = (id: string | null) =>
  useQuery({
    queryKey: imageVaultKeys.detail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error("Missing image id");
      const result = await imageVaultService.getImage(id);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    }
  });

export const useImageVaultModels = (enabled = true) =>
  useQuery({
    queryKey: imageVaultKeys.models(),
    enabled,
    queryFn: async () => {
      const result = await imageVaultService.listModels();
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    }
  });

export const useImageVaultCategories = (enabled = true) =>
  useQuery({
    queryKey: imageVaultKeys.categories(),
    enabled,
    queryFn: async () => {
      const result = await imageVaultService.listCategories();
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    }
  });

export const useImageVaultMutations = () => {
  const queryClient = useQueryClient();

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: imageVaultKeys.all });
  };

  const uploadImage = useMutation({
    mutationFn: async (input: {
      file: File;
      sourceFile?: File | null;
      metadata: Omit<CreateImageEntryPayload, "assetId" | "sourceAssetId">;
      onProgress?: (percent: number) => void;
    }) => {
      const result = await imageVaultService.uploadAndCreateImage(
        input.file,
        input.metadata,
        {
          sourceFile: input.sourceFile,
          onProgress: input.onProgress
        }
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    onSuccess: async () => {
      await invalidateAll();
      toast.success("Image added to vault");
    },
    onError: (error: unknown) => {
      toast.error("Upload failed", {
        description: handleAxiosError(error)
      });
    }
  });

  const updateImage = useMutation({
    mutationFn: async (input: {
      id: string;
      payload: UpdateImageEntryPayload;
    }) => {
      const result = await imageVaultService.updateImage(
        input.id,
        input.payload
      );
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    onSuccess: async (data) => {
      await invalidateAll();
      queryClient.setQueryData(imageVaultKeys.detail(data.id), data);
      toast.success("Image updated");
    },
    onError: (error: unknown) => {
      toast.error("Update failed", {
        description: handleAxiosError(error)
      });
    }
  });

  const deleteImage = useMutation({
    mutationFn: async (id: string) => {
      const result = await imageVaultService.deleteImage(id);
      if (!result.success) {
        throw result.error;
      }
    },
    onSuccess: async () => {
      await invalidateAll();
      toast.success("Image deleted");
    },
    onError: (error: unknown) => {
      toast.error("Delete failed", {
        description: handleAxiosError(error)
      });
    }
  });

  const createModel = useMutation({
    mutationFn: async (payload: {
      name: string;
      provider: string;
      isActive?: boolean;
    }) => {
      const result = await imageVaultService.createModel(payload);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: imageVaultKeys.models()
      });
      toast.success("Model created");
    },
    onError: (error: unknown) => {
      toast.error("Could not create model", {
        description: handleAxiosError(error)
      });
    }
  });

  const updateModel = useMutation({
    mutationFn: async (input: {
      id: string;
      payload: { name?: string; provider?: string; isActive?: boolean };
    }) => {
      const result = await imageVaultService.updateModel(
        input.id,
        input.payload
      );
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: imageVaultKeys.models()
      });
      await invalidateAll();
      toast.success("Model updated");
    },
    onError: (error: unknown) => {
      toast.error("Could not update model", {
        description: handleAxiosError(error)
      });
    }
  });

  const deleteModels = useMutation({
    mutationFn: async (ids: string[]) => {
      const result = await imageVaultService.deleteModels(ids);
      if (!result.success) throw result.error;
      return ids;
    },
    onSuccess: async (deletedIds) => {
      await queryClient.invalidateQueries({
        queryKey: imageVaultKeys.models()
      });
      await invalidateAll();
      toast.success(
        deletedIds.length === 1
          ? "Model deleted"
          : `${deletedIds.length} models deleted`
      );
    },
    onError: (error: unknown) => {
      toast.error("Could not delete model(s)", {
        description: handleAxiosError(error)
      });
    }
  });

  const createCategory = useMutation({
    mutationFn: async (payload: { name: string; slug: string }) => {
      const result = await imageVaultService.createCategory(payload);
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: imageVaultKeys.categories()
      });
      toast.success("Category created");
    },
    onError: (error: unknown) => {
      toast.error("Could not create category", {
        description: handleAxiosError(error)
      });
    }
  });

  const updateCategory = useMutation({
    mutationFn: async (input: {
      id: string;
      payload: { name?: string; slug?: string };
    }) => {
      const result = await imageVaultService.updateCategory(
        input.id,
        input.payload
      );
      if (!result.success) throw result.error;
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: imageVaultKeys.categories()
      });
      await invalidateAll();
      toast.success("Category updated");
    },
    onError: (error: unknown) => {
      toast.error("Could not update category", {
        description: handleAxiosError(error)
      });
    }
  });

  const deleteCategories = useMutation({
    mutationFn: async (ids: string[]) => {
      const result = await imageVaultService.deleteCategories(ids);
      if (!result.success) throw result.error;
      return ids;
    },
    onSuccess: async (deletedIds) => {
      await queryClient.invalidateQueries({
        queryKey: imageVaultKeys.categories()
      });
      await invalidateAll();
      toast.success(
        deletedIds.length === 1
          ? "Category deleted"
          : `${deletedIds.length} categories deleted`
      );
    },
    onError: (error: unknown) => {
      toast.error("Could not delete category(ies)", {
        description: handleAxiosError(error)
      });
    }
  });

  return {
    uploadImage,
    updateImage,
    deleteImage,
    createModel,
    updateModel,
    deleteModels,
    createCategory,
    updateCategory,
    deleteCategories
  };
};
