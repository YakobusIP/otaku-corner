import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import type { ImageVaultFilterGroup } from "@/features/image-vault/lib/image-vault-filter-expression";
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

type ImageVaultFiltersProviderProps = {
  children: ReactNode;
  persistVisibilityToUrl?: boolean;
  initialSensitiveImageVisibility?: SensitiveImageVisibility;
};

export const ImageVaultFiltersProvider = ({
  children,
  persistVisibilityToUrl = true,
  initialSensitiveImageVisibility
}: ImageVaultFiltersProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setInternalState] = useState<ImageVaultFiltersState>(() => {
    const visibilityFromUrl = persistVisibilityToUrl
      ? parseSensitiveImageVisibility(searchParams.get("visibility") ?? "")
      : undefined;

    return {
      groups: defaultState.groups,
      sensitiveImageVisibility:
        initialSensitiveImageVisibility ??
        visibilityFromUrl ??
        defaultState.sensitiveImageVisibility
    };
  });

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
    if (!persistVisibilityToUrl) return;
    const params = new URLSearchParams();
    params.set("visibility", state.sensitiveImageVisibility);
    setSearchParams(params, { replace: true });
  }, [
    persistVisibilityToUrl,
    setSearchParams,
    state.sensitiveImageVisibility
  ]);

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
