import { Bold, Italic, Underline, ListOrdered, List } from "lucide-react";

import { useSlate } from "slate-react";
import { CustomEditor, ElementType } from "@/lib/custom-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

export default function ReviewToolbar() {
  const editor = useSlate();

  const onHeadingChange = (value: string) => {
    switch (value) {
      case "heading-one": {
        CustomEditor.toggleBlock(editor, value as ElementType);
        return;
      }
      case "heading-two": {
        CustomEditor.toggleBlock(editor, value as ElementType);
        return;
      }
      case "heading-three": {
        CustomEditor.toggleBlock(editor, value as ElementType);
        return;
      }
      default: {
        CustomEditor.toggleBlock(editor, value as ElementType);
        return;
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border border-black p-1">
      <Select defaultValue="normal" onValueChange={onHeadingChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="heading-one">Heading 1</SelectItem>
          <SelectItem value="heading-two">Heading 2</SelectItem>
          <SelectItem value="heading-three">Heading 3</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
        </SelectContent>
      </Select>
      <Toggle
        aria-label="Toggle bold"
        pressed={CustomEditor.isMarkActive(editor, "bold")}
        onPressedChange={() => CustomEditor.toggleMark(editor, "bold")}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle italic"
        pressed={CustomEditor.isMarkActive(editor, "italic")}
        onPressedChange={() => CustomEditor.toggleMark(editor, "italic")}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle underline"
        pressed={CustomEditor.isMarkActive(editor, "underline")}
        onPressedChange={() => CustomEditor.toggleMark(editor, "underline")}
      >
        <Underline className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle ordered list"
        pressed={CustomEditor.isBlockActive(editor, "ordered-list")}
        onPressedChange={() => CustomEditor.toggleBlock(editor, "ordered-list")}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle
        aria-label="Toggle unordered list"
        pressed={CustomEditor.isBlockActive(editor, "unordered-list")}
        onPressedChange={() =>
          CustomEditor.toggleBlock(editor, "unordered-list")
        }
      >
        <List className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
