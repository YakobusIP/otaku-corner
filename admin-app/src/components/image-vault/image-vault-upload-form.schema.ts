import { z } from "zod";

const trim = (value: string) => value.trim();

export const imageVaultUploadFormSchema = z
  .object({
    originType: z.enum(["AI", "HUMAN"]),
    modelId: z.string(),
    prompt: z.string(),
    originalPrompt: z.string(),
    sourceUrl: z.string(),
    categoryIds: z.array(z.string()).max(3, "Select at most 3 categories."),
    notes: z.string(),
    isExplicit: z.boolean(),
    explicitReason: z.string()
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
    if (!data.isExplicit && trim(data.explicitReason)) {
      ctx.addIssue({
        code: "custom",
        message: "Explicit reason is only allowed when explicit is enabled.",
        path: ["explicitReason"]
      });
    }
  });

export type ImageVaultUploadFormValues = z.infer<
  typeof imageVaultUploadFormSchema
>;

export const createImageVaultUploadDefaultValues = (
  categoryIds: string[] = []
): ImageVaultUploadFormValues => ({
  originType: "AI",
  modelId: "",
  prompt: "",
  originalPrompt: "",
  sourceUrl: "",
  categoryIds,
  notes: "",
  isExplicit: false,
  explicitReason: ""
});
