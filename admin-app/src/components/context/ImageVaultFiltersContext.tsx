import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import type { ImageOriginType } from "@/types/image-vault.type";

import { useSearchParams } from "react-router-dom";

const VALID_ORIGINS: ReadonlySet<string> = new Set(["AI", "HUMAN"]);

const validateOrigin = (value: string | null): ImageOriginType | "all" => {
  if (!value || value === "all") {
    return "all";
  }
  if (VALID_ORIGINS.has(value)) {
    return value as ImageOriginType;
  }
  return "all";
};

const parseBooleanParam = (value: string | null): boolean =>
  value === "true" || value === "1";

const readBooleanParam = (
  searchParams: URLSearchParams,
  key: string,
  fallback: boolean
): boolean => {
  if (!searchParams.has(key)) {
    return fallback;
  }
  return parseBooleanParam(searchParams.get(key));
};

export type ImageVaultFiltersState = {
  search: string;
  originType: ImageOriginType | "all";
  modelId: string;
  categoryId: string;
  explicitOnly: boolean;
  hideExplicitImages: boolean;
};

type ImageVaultFiltersContextValue = {
  state: ImageVaultFiltersState;
  setState: (updater: Partial<ImageVaultFiltersState>) => void;
};

const defaultState: ImageVaultFiltersState = {
  search: "",
  originType: "all",
  modelId: "",
  categoryId: "",
  explicitOnly: false,
  hideExplicitImages: true
};

const ImageVaultFiltersContext = createContext<
  ImageVaultFiltersContextValue | undefined
>(undefined);

const readStateFromSearchParams = (
  searchParams: URLSearchParams
): Pick<
  ImageVaultFiltersState,
  "search" | "originType" | "explicitOnly" | "hideExplicitImages"
> => ({
  search: searchParams.get("q") ?? defaultState.search,
  originType: validateOrigin(searchParams.get("origin")),
  explicitOnly: readBooleanParam(
    searchParams,
    "explicit_only",
    defaultState.explicitOnly
  ),
  hideExplicitImages: readBooleanParam(
    searchParams,
    "hide_explicit_images",
    defaultState.hideExplicitImages
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
    params.set("explicit_only", state.explicitOnly ? "true" : "false");
    params.set(
      "hide_explicit_images",
      state.hideExplicitImages ? "true" : "false"
    );

    setSearchParams(params, { replace: true });
  }, [
    setSearchParams,
    state.explicitOnly,
    state.hideExplicitImages,
    state.originType,
    state.search
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
