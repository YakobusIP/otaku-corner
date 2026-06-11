type LibraryNavigationState = {
  librarySearch?: string;
};

type LocationWithNavigationState = {
  state: unknown;
};

export function getMediaLibraryBackPath(
  location: LocationWithNavigationState
): string {
  const state = location.state as LibraryNavigationState | null;
  const search = state?.librarySearch;

  if (typeof search === "string" && search.length > 0) {
    return `/media-list${search.startsWith("?") ? search : `?${search}`}`;
  }

  return "/media-list";
}

export function createDetailNavigationState(
  search: string
): LibraryNavigationState {
  return { librarySearch: search };
}
