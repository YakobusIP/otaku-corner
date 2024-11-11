import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

import { BLOCK_TYPES, INLINE_STYLES } from "@/lib/enums";

import { EditorState } from "draft-js";
import {
  BoldIcon,
  ImageIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  UnderlineIcon
} from "lucide-react";

type Props = {
  editorState: EditorState;
  toggleBlockType: (blockType: string) => void;
  toggleInlineStyle: (inlineStyle: string) => void;
  insertImage: () => void;
};

export default function ReviewToolbar({
  editorState,
  toggleBlockType,
  toggleInlineStyle,
  insertImage
}: Props) {
  const currentStyle = editorState.getCurrentInlineStyle();
  const selection = editorState.getSelection();
  const blockKey = selection.getStartKey();
  const contentState = editorState.getCurrentContent();
  const block = contentState.getBlockForKey(blockKey);
  const blockType = block.getType();

  const isBlockActive = (blockTypeToCheck: string) =>
    blockType === blockTypeToCheck;

  const isInlineStyleActive = (inlineStyle: string) =>
    currentStyle.has(inlineStyle);

  const onHeadingChange = (value: string) => {
    toggleBlockType(value);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border border-black p-1">
      <Select value={blockType} onValueChange={onHeadingChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={BLOCK_TYPES.HEADING_ONE}>Heading 1</SelectItem>
          <SelectItem value={BLOCK_TYPES.HEADING_TWO}>Heading 2</SelectItem>
          <SelectItem value={BLOCK_TYPES.HEADING_THREE}>Heading 3</SelectItem>
          <SelectItem value={BLOCK_TYPES.PARAGRAPH}>Normal</SelectItem>
        </SelectContent>
      </Select>
      <Toggle
        aria-label="Toggle bold"
        pressed={isInlineStyleActive(INLINE_STYLES.BOLD)}
        onPressedChange={() => toggleInlineStyle(INLINE_STYLES.BOLD)}
      >
        <BoldIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle italic"
        pressed={isInlineStyleActive(INLINE_STYLES.ITALIC)}
        onPressedChange={() => toggleInlineStyle(INLINE_STYLES.ITALIC)}
      >
        <ItalicIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle underline"
        pressed={isInlineStyleActive(INLINE_STYLES.UNDERLINE)}
        onPressedChange={() => toggleInlineStyle(INLINE_STYLES.UNDERLINE)}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle ordered list"
        pressed={isBlockActive(BLOCK_TYPES.ORDERED_LIST)}
        onPressedChange={() => toggleBlockType(BLOCK_TYPES.ORDERED_LIST)}
      >
        <ListOrderedIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle unordered list"
        pressed={isBlockActive(BLOCK_TYPES.UNORDERED_LIST)}
        onPressedChange={() => toggleBlockType(BLOCK_TYPES.UNORDERED_LIST)}
      >
        <ListIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Insert image"
        pressed={false}
        onPressedChange={insertImage}
      >
        <ImageIcon className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
