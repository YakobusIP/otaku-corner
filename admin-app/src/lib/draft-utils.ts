import ReviewImage from "@/components/ReviewImage";

import { BLOCK_TYPES } from "@/lib/enums";

import {
  CompositeDecorator,
  ContentBlock,
  ContentState,
  DraftStyleMap
} from "draft-js";
import { DefaultDraftBlockRenderMap, DraftBlockRenderMap } from "draft-js";
import Immutable from "immutable";

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

const blockRenderMap: DraftBlockRenderMap = Immutable.Map({
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

export const extractExistingImages = (
  blocks: ContentBlock[],
  contentState: ContentState
) => {
  const currentImageIds: string[] = [];
  blocks.forEach((block) => {
    if (block.getType() === BLOCK_TYPES.IMAGE) {
      const entityKey = block.getEntityAt(0);
      if (entityKey) {
        const entity = contentState.getEntity(entityKey);
        const { src } = entity.getData();
        const stringSrc = src as string;
        const id = stringSrc.substring(
          stringSrc.lastIndexOf("/") + 1,
          stringSrc.lastIndexOf(".")
        );
        currentImageIds.push(id);
      }
    }
  });

  return currentImageIds;
};
