import {
  IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY,
  isExplicitSafetyLevel
} from "@/types/image-vault.type";
import type {
  ImageVaultEntry,
  ImageVaultSafetyLevel
} from "@/types/image-vault.type";

import { z } from "zod";

const trim = (value: string) => value.trim();

export const imageVaultUploadFormSchema = z
  .object({
    originType: z.enum(["AI", "HUMAN"]),
    modelId: z.string(),
    prompt: z.string(),
    originalPrompt: z.string(),
    sourceUrl: z.string(),
    categoryIds: z
      .array(z.string())
      .max(
        IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY,
        `Select at most ${IMAGE_VAULT_MAX_CATEGORIES_PER_ENTRY} categories.`
      ),
    notes: z.string(),
    safetyLevel: z.enum(["SAFE", "NSFW", "EXPLICIT"]),
    safetyReason: z.string()
  })
  .superRefine((data, ctx) => {
    if (data.originType === "AI") {
      if (!trim(data.modelId)) {
        ctx.addIssue({
          code: "custom",
          message: "Model is required.",
          path: ["modelId"]
        });
      }
      if (!trim(data.prompt)) {
        ctx.addIssue({
          code: "custom",
          message: "Prompt is required.",
          path: ["prompt"]
        });
      }
      if (trim(data.sourceUrl)) {
        ctx.addIssue({
          code: "custom",
          message: "AI images cannot include a source URL.",
          path: ["sourceUrl"]
        });
      }
      return;
    }

    if (trim(data.modelId)) {
      ctx.addIssue({
        code: "custom",
        message: "Human images cannot include a model.",
        path: ["modelId"]
      });
    }
    if (trim(data.prompt)) {
      ctx.addIssue({
        code: "custom",
        message: "Human images cannot include a prompt.",
        path: ["prompt"]
      });
    }
    if (trim(data.originalPrompt)) {
      ctx.addIssue({
        code: "custom",
        message: "Human images cannot include an original prompt.",
        path: ["originalPrompt"]
      });
    }
    if (trim(data.sourceUrl)) {
      const parsed = z.url().safeParse(data.sourceUrl);
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid source URL.",
          path: ["sourceUrl"]
        });
      }
    }
  })
  .superRefine((data, ctx) => {
    if (trim(data.originalPrompt) && !trim(data.prompt)) {
      ctx.addIssue({
        code: "custom",
        message: "Original prompt requires a prompt.",
        path: ["originalPrompt"]
      });
    }
    if (isExplicitSafetyLevel(data.safetyLevel) && !trim(data.safetyReason)) {
      ctx.addIssue({
        code: "custom",
        message: "Safety reason is required for explicit content.",
        path: ["safetyReason"]
      });
    }
  });

export type ImageVaultUploadFormValues = z.infer<
  typeof imageVaultUploadFormSchema
>;

export type ImageVaultUploadParentDefaults = {
  categoryIds?: string[];
  modelId?: string;
  safetyLevel?: ImageVaultSafetyLevel;
  safetyReason?: string | null;
};

export const createImageVaultDetailFormValues = (
  image: ImageVaultEntry
): ImageVaultUploadFormValues => ({
  originType: image.originType,
  modelId: image.model?.id ?? "",
  prompt: image.prompt ?? "",
  originalPrompt: image.originalPrompt ?? "",
  sourceUrl: image.sourceUrl ?? "",
  categoryIds: image.categories.map((category) => category.id),
  notes: image.notes ?? "",
  safetyLevel: image.safetyLevel,
  safetyReason: image.safetyReason ?? ""
});

export const createImageVaultUploadDefaultValues = (
  parentDefaults: ImageVaultUploadParentDefaults = {}
): ImageVaultUploadFormValues => {
  const safetyLevel = parentDefaults.safetyLevel ?? "SAFE";
  const safetyReason =
    safetyLevel !== "SAFE"
      ? (parentDefaults.safetyReason?.trim() ?? "")
      : "";

  return {
    originType: "AI",
    modelId: parentDefaults.modelId ?? "",
    prompt: "",
    originalPrompt: "",
    sourceUrl: "",
    categoryIds: parentDefaults.categoryIds ?? [],
    notes: "",
    safetyLevel,
    safetyReason
  };
};
