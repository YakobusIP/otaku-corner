import { ClipboardEventHandler, Dispatch, SetStateAction } from "react";

import { uploadService } from "@/services/upload.service";

import { useToast } from "@/hooks/useToast";

import { MEDIA_TYPE } from "@/lib/enums";

import { useMutation } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";

type Props = {
  review: string | undefined;
  setReview: Dispatch<SetStateAction<string | undefined>>;
  mediaType: MEDIA_TYPE;
  reviewId: number;
  setUploadedImages: Dispatch<SetStateAction<string[]>>;
};

export default function ReviewEditor({
  review,
  setReview,
  mediaType,
  reviewId,
  setUploadedImages
}: Props) {
  const toast = useToast();

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadService.upload(file, mediaType, reviewId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onError: (error: Error) => {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  });

  const insertImage = async (file: File) => {
    try {
      const { url, id } = await uploadImageMutation.mutateAsync(file);
      return { url, id };
    } catch {
      // Handled by mutation onError.
    }

    return null;
  };

  const handlePaste: ClipboardEventHandler<HTMLDivElement> = async (event) => {
    const clipboardData = event.clipboardData;
    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file" && items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          const image = await insertImage(file);
          if (image) {
            setUploadedImages((prev) => ({ ...prev, [image.url]: image.id }));
            const markdownImage = `![image](${image.url})`;
            insertTextAtCursor(markdownImage);
          }
        }
      }
    }
  };

  const insertTextAtCursor = (text: string) => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end, textarea.value.length);
    textarea.value = before + text + after;
    setReview(textarea.value);
  };

  return (
    <div data-color-mode="dark" className="review-editor-dark">
      <style>
        {`
          ol {
            list-style: decimal;
          }

          ul {
            list-style: disc;
          }
            
          .wmde-markdown img {
            display: block;
            width: 40%;
            margin: 0 auto;
          }

          @media (max-width: 1280px) {
            .wmde-markdown img {
              width: 50%;
            }
          }

          @media (max-width: 768px) {
            .wmde-markdown img {
              width: 70%;
            }
          }

          @media (max-width: 480px) {
            .wmde-markdown img {
              width: 100%;
            }
          }
          
          .wmde-markdown table {
            display: table;
            width: 100%;
            overflow: visible;
            clear: none;
            margin-top: 0;
          }

          .review-editor-dark .w-md-editor {
            background-color: hsl(var(--background) / 0.4);
            border: 1px solid hsl(var(--border) / 0.6);
            border-radius: 0.5rem;
            backdrop-filter: blur(12px);
            color: hsl(var(--foreground));
            --md-editor-font-family: inherit;
            box-shadow: none;
          }

          .review-editor-dark .w-md-editor-toolbar {
            background-color: hsl(var(--background) / 0.6);
            border-bottom: 1px solid hsl(var(--border) / 0.5);
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
          }

          .review-editor-dark .w-md-editor-toolbar ul > li > button {
            color: hsl(var(--muted-foreground));
          }

          .review-editor-dark .w-md-editor-toolbar ul > li > button:hover,
          .review-editor-dark .w-md-editor-toolbar ul > li.active > button {
            color: hsl(var(--foreground));
            background-color: hsl(var(--muted) / 0.4);
          }

          .review-editor-dark .w-md-editor-toolbar-divider {
            background-color: hsl(var(--border) / 0.6);
          }

          .review-editor-dark .w-md-editor-text,
          .review-editor-dark .w-md-editor-text-pre,
          .review-editor-dark .w-md-editor-text-input,
          .review-editor-dark .w-md-editor-input {
            background-color: transparent !important;
            color: hsl(var(--foreground)) !important;
          }

          .review-editor-dark .w-md-editor-text-pre > code,
          .review-editor-dark .w-md-editor-text-input {
            color: hsl(var(--foreground)) !important;
            -webkit-text-fill-color: hsl(var(--foreground)) !important;
          }

          .review-editor-dark .w-md-editor-preview {
            background-color: hsl(var(--background) / 0.3);
            border-left: 1px solid hsl(var(--border) / 0.5);
          }

          .review-editor-dark .wmde-markdown {
            background-color: transparent;
            color: hsl(var(--foreground));
          }

          .review-editor-dark .wmde-markdown code {
            background-color: hsl(var(--muted) / 0.5);
          }

          .review-editor-dark .wmde-markdown pre {
            background-color: hsl(var(--muted) / 0.4);
          }

          .review-editor-dark .wmde-markdown blockquote {
            border-left-color: hsl(var(--border));
            color: hsl(var(--muted-foreground));
          }

          .review-editor-dark .w-md-editor-bar {
            background-color: hsl(var(--background) / 0.4);
          }
          `}
      </style>
      <MDEditor
        value={review}
        onChange={setReview}
        onPaste={handlePaste}
        height={400}
      />
    </div>
  );
}
