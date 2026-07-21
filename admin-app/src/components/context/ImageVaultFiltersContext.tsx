import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import type { ImageVaultFilterGroup } from "@/lib/image-vault-filter-expression";
import type { SensitiveImageVisibility } from "@/types/image-vault.type";
import { parseSensitiveImageVisibility } from "@/types/image-vault.type";

import { useSearchParams } from "react-router-dom";

export type ImageVaultFiltersState = {
  groups: ImageVaultFilterGroup[];
  sensitiveImageVisibility: SensitiveImageVisibility;
};

const defaultState: ImageVaultFiltersState = {
  groups: [],
  sensitiveImageVisibility: "MASK_EXPLICIT"
};

type ImageVaultFiltersContextValue = {
  state: ImageVaultFiltersState;
  setState: (updater: Partial<ImageVaultFiltersState>) => void;
  setGroups: (
    updater:
      | ImageVaultFilterGroup[]
      | ((prev: ImageVaultFilterGroup[]) => ImageVaultFilterGroup[])
  ) => void;
};

const ImageVaultFiltersContext = createContext<
  ImageVaultFiltersContextValue | undefined
>(undefined);

export const ImageVaultFiltersProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setInternalState] = useState<ImageVaultFiltersState>(() => ({
    ...defaultState,
    sensitiveImageVisibility:
      parseSensitiveImageVisibility(searchParams.get("visibility") ?? "") ??
      defaultState.sensitiveImageVisibility
  }));

  const setState = useCallback((updater: Partial<ImageVaultFiltersState>) => {
    setInternalState((prev) => ({ ...prev, ...updater }));
  }, []);

  const setGroups = useCallback(
    (
      updater:
        | ImageVaultFilterGroup[]
        | ((prev: ImageVaultFilterGroup[]) => ImageVaultFilterGroup[])
    ) => {
      setInternalState((prev) => ({
        ...prev,
        groups: typeof updater === "function" ? updater(prev.groups) : updater
      }));
    },
    []
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("visibility", state.sensitiveImageVisibility);
    setSearchParams(params, { replace: true });
  }, [setSearchParams, state.sensitiveImageVisibility]);

  const value = useMemo(
    () => ({
      state,
      setState,
      setGroups
    }),
    [setGroups, setState, state]
  );

  return (
    <ImageVaultFiltersContext.Provider value={value}>
      {children}
    </ImageVaultFiltersContext.Provider>
  );
};

export function useImageVaultFilters() {
  const context = useContext(ImageVaultFiltersContext);
  if (!context) {
    throw new Error(
      "useImageVaultFilters must be used within an ImageVaultFiltersProvider"
    );
  }
  return context;
}
