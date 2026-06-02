import { type Dispatch, type ReactNode, type SetStateAction } from "react";

import { type LucideIcon } from "lucide-react";

type MediaDetailMetaItem = {
  key: string;
  icon: LucideIcon;
  label: string;
};

export type MediaDetailTopContent = {
  title: string;
  titleJapanese: string;
  genreTags: string[];
  metaItems: MediaDetailMetaItem[];
  footerMeta?: MediaDetailMetaItem;
  posterUrl: string;
  trailerEmbedUrl?: string;
};

export type MediaDetailSpoilerState = {
  showSpoilerWarning: boolean;
  setShowSpoilerWarning: Dispatch<SetStateAction<boolean>>;
  spoilersRevealed: boolean;
  setSpoilersRevealed: Dispatch<SetStateAction<boolean>>;
  handleRevealSpoilers: () => void;
};

type MediaDetailTabDefinition = {
  value: string;
  label: string;
  Icon: LucideIcon;
  content: ReactNode;
};

export type MediaDetailClientConfig<
  TDetail,
  TPageState extends MediaDetailSpoilerState
> = {
  tabHighlightLayoutId: string;
  defaultTab: string;
  useDetailPage: (id: number) => TPageState;
  selectDetail: (pageState: TPageState) => TDetail | undefined;
  selectSynopsis: (detail: TDetail) => string;
  buildTopContent: (
    detail: TDetail,
    pageState: TPageState
  ) => MediaDetailTopContent;
  renderScoresCard: (detail: TDetail) => ReactNode;
  buildTabs: (
    detail: TDetail,
    spoilerState: MediaDetailSpoilerState
  ) => MediaDetailTabDefinition[];
};
