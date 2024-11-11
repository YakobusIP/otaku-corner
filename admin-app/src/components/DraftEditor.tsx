import { Dispatch, SetStateAction, useCallback } from "react";

import { uploadImageService } from "@/services/upload.service";

import ReviewToolbar from "@/components/ReviewToolbar";

import { useToast } from "@/hooks/useToast";

import { extendedBlockRenderMap, styleMap } from "@/lib/draft-utils";
import { BLOCK_TYPES, MEDIA_TYPE } from "@/lib/enums";

import { AtomicBlockUtils, Editor, EditorState, RichUtils } from "draft-js";

type Props = {
  editorState: EditorState;
  setEditorState: Dispatch<SetStateAction<EditorState>>;
  mediaType: MEDIA_TYPE;
  mediaId: string;
  setUploadedImages: Dispatch<SetStateAction<string[]>>;
};

export default function DraftEditor({
  editorState,
  setEditorState,
  mediaType,
  mediaId,
  setUploadedImages
}: Props) {
  const toast = useToast();

  const handleKeyCommand = useCallback(
    (command: string, editorState: EditorState) => {
      const newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        setEditorState(newState);
        return "handled";
      }
      return "not-handled";
    },
    [setEditorState]
  );

  const toggleBlockType = (blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const insertImage = async (
    file: File,
    trackImage: (url: string, id: string) => void
  ) => {
    const response = await uploadImageService(file, mediaType, mediaId);
    if (response.success) {
      const { url, id } = response.data;
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        "IMAGE",
        "IMMUTABLE",
        { src: url }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

      const newEditorState = EditorState.set(editorState, {
        currentContent: contentStateWithEntity
      });
      const finalEditorState = AtomicBlockUtils.insertAtomicBlock(
        newEditorState,
        entityKey,
        " "
      );
      setEditorState(finalEditorState);
      trackImage(url, id);
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
  };

  const handlePastedFiles = (blobs: Blob[]) => {
    const blob = blobs[0];
    if (blob && blob.type.startsWith("image/")) {
      insertImage(blob as File, (url, id) =>
        setUploadedImages((prev) => ({ ...prev, [url]: id }))
      );
      return "handled";
    }
    return "not-handled";
  };

  const insertImageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file && file.type.startsWith("image/")) {
        insertImage(file, (url, id) =>
          setUploadedImages((prev) => ({ ...prev, [url]: id }))
        );
      }
    };
  };

  return (
    <>
      <ReviewToolbar
        editorState={editorState}
        toggleBlockType={toggleBlockType}
        toggleInlineStyle={toggleInlineStyle}
        insertImage={insertImageHandler}
      />
      <div className="border border-b-black border-x-black p-1 focus:outline-none">
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          blockStyleFn={(block) => {
            switch (block.getType()) {
              case BLOCK_TYPES.HEADING_ONE:
                return "header-one";
              case BLOCK_TYPES.HEADING_TWO:
                return "header-two";
              case BLOCK_TYPES.HEADING_THREE:
                return "header-three";
              case BLOCK_TYPES.ORDERED_LIST:
                return "ordered-list-item";
              case BLOCK_TYPES.UNORDERED_LIST:
                return "unordered-list-item";
              default:
                return "";
            }
          }}
          handlePastedFiles={handlePastedFiles}
          customStyleMap={styleMap}
          blockRenderMap={extendedBlockRenderMap}
          placeholder="Enter review here"
        />
      </div>
    </>
  );
}
