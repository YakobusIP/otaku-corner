import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import type {
  ImageOriginType,
  ImageVaultSafetyLevel,
  SensitiveImageVisibility
} from "@/types/image-vault.type";
import {
  parseOriginFilter,
  parseSafetyFilter,
  parseSensitiveImageVisibility
} from "@/types/image-vault.type";

import { useSearchParams } from "react-router-dom";

export type ImageVaultFiltersState = {
  search: string;
  originType: ImageOriginType | "all";
  modelId: string;
  categoryId: string;
  safetyFilter: ImageVaultSafetyLevel | "all";
  sensitiveImageVisibility: SensitiveImageVisibility;
};

const defaultState: ImageVaultFiltersState = {
  search: "",
  originType: "all",
  modelId: "",
  categoryId: "",
  safetyFilter: "all",
  sensitiveImageVisibility: "MASK_EXPLICIT"
};

const parseVisibilityFilter = (
  value: string | null
): SensitiveImageVisibility =>
  parseSensitiveImageVisibility(value ?? "") ??
  defaultState.sensitiveImageVisibility;

type ImageVaultFiltersContextValue = {
  state: ImageVaultFiltersState;
  setState: (updater: Partial<ImageVaultFiltersState>) => void;
};

const ImageVaultFiltersContext = createContext<
  ImageVaultFiltersContextValue | undefined
>(undefined);

const readStateFromSearchParams = (
  searchParams: URLSearchParams
): Pick<
  ImageVaultFiltersState,
  "search" | "originType" | "safetyFilter" | "sensitiveImageVisibility"
> => ({
  search: searchParams.get("q") ?? defaultState.search,
  originType: parseOriginFilter(searchParams.get("origin")),
  safetyFilter: parseSafetyFilter(searchParams.get("safety")),
  sensitiveImageVisibility: parseVisibilityFilter(
    searchParams.get("visibility")
  )
});

export const ImageVaultFiltersProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setInternalState] = useState<ImageVaultFiltersState>(() => ({
    ...defaultState,
    ...readStateFromSearchParams(searchParams)
  }));

  const setState = useCallback((updater: Partial<ImageVaultFiltersState>) => {
    setInternalState((prev) => ({ ...prev, ...updater }));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (state.search) {
      params.set("q", state.search);
    }
    params.set("origin", state.originType);
    params.set("safety", state.safetyFilter);
    params.set("visibility", state.sensitiveImageVisibility);

    setSearchParams(params, { replace: true });
  }, [
    setSearchParams,
    state.originType,
    state.safetyFilter,
    state.search,
    state.sensitiveImageVisibility
  ]);

  const value = useMemo(
    () => ({
      state,
      setState
    }),
    [setState, state]
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
