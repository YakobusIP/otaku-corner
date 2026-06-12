import { getMediaLibraryBackPath } from "@/lib/media-library-navigation";

import { useLocation } from "react-router-dom";

export function useMediaLibraryBackPath() {
  const location = useLocation();
  return getMediaLibraryBackPath(location);
}
