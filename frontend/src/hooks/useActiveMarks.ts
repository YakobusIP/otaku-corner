import { useEffect, useState, useCallback } from "react";
import { useSlate } from "slate-react";
import { CustomEditor, MarkType } from "@/lib/custom-editor";

const useActiveMarks = () => {
  const editor = useSlate();
  const [activeMarks, setActiveMarks] = useState<string[]>([]);

  const getActiveMark = useCallback(() => {
    const markTypes: MarkType[] = ["bold", "italic", "underline"];
    return markTypes.reduce<string[]>((activeMarks, markType) => {
      if (CustomEditor.isMarkActive(editor, markType)) {
        activeMarks.push(markType);
      }
      return activeMarks;
    }, []);
  }, [editor]);

  useEffect(() => {
    const callback = () => {
      setActiveMarks(getActiveMark());
    };

    const { selection } = editor;
    if (selection) {
      callback();
    }
  }, [editor, getActiveMark]);

  return activeMarks;
};

export default useActiveMarks;
