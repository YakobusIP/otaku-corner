import { ClipboardEventHandler, Dispatch, SetStateAction } from "react";

import { uploadImageService } from "@/services/upload.service";

import { useToast } from "@/hooks/useToast";

import { MEDIA_TYPE } from "@/lib/enums";

import MDEditor from "@uiw/react-md-editor";

type Props = {
  review: string | undefined;
  setReview: Dispatch<SetStateAction<string | undefined>>;
  mediaType: MEDIA_TYPE;
  mediaId: string;
  setUploadedImages: Dispatch<SetStateAction<string[]>>;
};

export default function ReviewEditor({
  review,
  setReview,
  mediaType,
  mediaId,
  setUploadedImages
}: Props) {
  const toast = useToast();

  const insertImage = async (file: File) => {
    const response = await uploadImageService(file, mediaType, mediaId);
    if (response.success) {
      const { url, id } = response.data;
      return { url, id };
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
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
    <div data-color-mode="light">
      <style>
        {`.wmde-markdown img {
            display: block;
            width: 40%;
            margin: 0 auto;
          }`}
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
