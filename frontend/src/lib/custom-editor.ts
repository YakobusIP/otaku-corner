import { Transforms, BaseEditor, Editor, Element as SlateElement } from "slate";
import { ReactEditor } from "slate-react";

type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};
type ListItemElement = {
  type: "list-item";
  children: CustomText[];
};
type OrderedListElement = {
  type: "ordered-list";
  children: CustomText[];
};
type UnorderedListElement = {
  type: "unordered-list";
  children: CustomText[];
};
type HeadingOneElement = {
  type: "heading-one";
  children: CustomText[];
};
type HeadingTwoElement = {
  type: "heading-two";
  children: CustomText[];
};
type HeadingThreeElement = {
  type: "heading-three";
  children: CustomText[];
};

export type CustomElement =
  | ParagraphElement
  | ListItemElement
  | OrderedListElement
  | UnorderedListElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement;
export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type MarkType = "bold" | "italic" | "underline";
export type ElementType =
  | "paragraph"
  | "list-item"
  | "ordered-list"
  | "unordered-list"
  | "heading-one"
  | "heading-two"
  | "heading-three";

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export const CustomEditor = {
  isMarkActive(editor: Editor, format: MarkType) {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  },

  toggleMark(editor: Editor, format: MarkType) {
    const isActive = CustomEditor.isMarkActive(editor, format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  },

  isBlockActive(editor: Editor, format: ElementType) {
    const [match] = Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === format
    });

    return !!match;
  },

  toggleBlock(editor: Editor, format: ElementType) {
    const isActive = CustomEditor.isBlockActive(editor, format);
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n.type === "ordered-list" || n.type === "unordered-list"),
      split: true
    });

    let newProperties: Partial<SlateElement>;
    if (
      !isActive &&
      (format === "ordered-list" || format === "unordered-list")
    ) {
      newProperties = { type: "list-item" };
      Transforms.setNodes(editor, newProperties);
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    } else {
      newProperties = { type: isActive ? "paragraph" : format };
      Transforms.setNodes(editor, newProperties);
    }
  },

  handleEnterKey(editor: Editor, event: KeyboardEvent) {
    if (event.shiftKey) {
      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          (n.type === "ordered-list" || n.type === "unordered-list"),
        split: true
      });

      Transforms.setNodes(editor, { type: "paragraph" });
      return;
    }

    const [match] = Editor.nodes(editor, {
      match: (n) =>
        SlateElement.isElement(n) &&
        (n.type === "ordered-list" || n.type === "unordered-list")
    });

    if (match) {
      Transforms.splitNodes(editor, { always: true });
    } else {
      Editor.insertBreak(editor);
    }
  }
};
