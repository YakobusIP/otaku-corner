import {
  DraftStyleMap,
  CompositeDecorator,
  ContentBlock,
  ContentState
} from "draft-js";
import ReviewImage from "@/components/global/ReviewImage";
import { DefaultDraftBlockRenderMap, DraftBlockRenderMap } from "draft-js";
import Immutable from "immutable";
import { BLOCK_TYPES } from "@/lib/enums";

export const styleMap: DraftStyleMap = {
  BOLD: {
    fontWeight: "bold"
  },
  ITALIC: {
    fontStyle: "italic"
  },
  UNDERLINE: {
    textDecoration: "underline"
  }
};

export const blockRenderMap: DraftBlockRenderMap = Immutable.Map({
  [BLOCK_TYPES.IMAGE]: {
    element: "figure"
  }
});

export const extendedBlockRenderMap =
  DefaultDraftBlockRenderMap.merge(blockRenderMap);

const findImageEntities = (
  block: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) => {
  block.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "IMAGE"
    );
  }, callback);
};

export const decorator = new CompositeDecorator([
  {
    strategy: findImageEntities,
    component: ReviewImage
  }
]);
