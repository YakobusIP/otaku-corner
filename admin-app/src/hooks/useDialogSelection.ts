import { useState } from "react";

export const useDialogSelection = <T>() => {
  const [selected, setSelected] = useState<T | null>(null);

  return {
    selected,
    open: selected !== null,
    select: setSelected,
    close: () => setSelected(null)
  };
};
