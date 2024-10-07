import { LightNovelDetail, LightNovelReview } from "@/types/lightnovel.type";
import { TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateLightNovelReviewService } from "@/services/lightnovel.service";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { ContentState, convertToRaw, EditorState } from "draft-js";
import DOMPurify from "dompurify";
import htmlToDraft from "html-to-draftjs";
import { BLOCK_TYPES, MEDIA_TYPE } from "@/lib/enums";
import draftToHtml from "draftjs-to-html";
import { deleteImageService } from "@/services/upload.service";
import { decorator } from "@/lib/draft-utils";
import DraftEditor from "@/components/admin/DraftEditor";

type Props = {
  lightNovelDetail: LightNovelDetail;
};

export default function ReviewTab({ lightNovelDetail }: Props) {
  const toast = useToast();

  let initialEditorState: EditorState;
  const currentImageIds: string[] = [];
  if (lightNovelDetail.review) {
    const sanitizedHTML = DOMPurify.sanitize(lightNovelDetail.review);
    const blocksFromHtml = htmlToDraft(sanitizedHTML);
    if (blocksFromHtml) {
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(
        contentBlocks,
        entityMap
      );
      initialEditorState = EditorState.createWithContent(
        contentState,
        decorator
      );

      const blocks = contentState.getBlocksAsArray();

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
    } else {
      initialEditorState = EditorState.createEmpty(decorator);
    }
  } else {
    initialEditorState = EditorState.createEmpty(decorator);
  }

  const [editorState, setEditorState] = useState(initialEditorState);
  const [uploadedImages, setUploadedImages] =
    useState<string[]>(currentImageIds);
  const [storylineRating, setStorylineRating] = useState(
    lightNovelDetail.storylineRating || 10
  );
  const [worldBuildingRating, setWorldBuildingRating] = useState(
    lightNovelDetail.worldBuildingRating || 10
  );
  const [illustrationRating, setIllustrationRating] = useState(
    lightNovelDetail.illustrationRating || 10
  );
  const [enjoymentRating, setEnjoymentRating] = useState(
    lightNovelDetail.enjoymentRating || 10
  );
  const [isLoadingUpdateReview, setIsLoadingUpdateReview] = useState(false);
  const ratingDescriptions: { [key: number]: string } = {
    0: "Abysmal",
    1: "Terrible",
    2: "Horrible",
    3: "Bad",
    4: "Poor",
    5: "Average",
    6: "Decent",
    7: "Good",
    8: "Great",
    9: "Excellent",
    10: "Masterpiece"
  };

  const onSubmit = async () => {
    setIsLoadingUpdateReview(true);

    const rawContentState = convertToRaw(editorState.getCurrentContent());
    const html = draftToHtml(rawContentState);

    const contentState = editorState.getCurrentContent();
    const blocks = contentState.getBlocksAsArray();
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

    const previouslyUploadedImageIds = Object.values(uploadedImages);
    const removedImageIds = previouslyUploadedImageIds.filter(
      (id) => !currentImageIds.includes(id)
    );

    await Promise.all(
      removedImageIds.map((id) => {
        return deleteImageService(id);
      })
    );

    const data: LightNovelReview = {
      review: html,
      storylineRating,
      worldBuildingRating,
      illustrationRating,
      enjoymentRating,
      personalScore:
        (storylineRating +
          worldBuildingRating +
          illustrationRating +
          enjoymentRating) /
        4
    };
    const response = await updateLightNovelReviewService(
      lightNovelDetail.id,
      data
    );
    if (response.success) {
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
    } else {
      toast.toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingUpdateReview(false);
  };

  return (
    <TabsContent value="reviews">
      <div className="flex flex-col pt-4">
        <h2 className="mb-4">Reviews</h2>
        <div className="flex flex-col xl:flex-row items-center gap-4 mb-4">
          <div className="flex flex-col gap-2 w-full">
            <Label>Storyline</Label>
            <Select
              defaultValue="10"
              value={storylineRating.toString()}
              onValueChange={(value) => setStorylineRating(parseInt(value, 10))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...Array(11).keys()].map((rating) => {
                  return (
                    <SelectItem
                      key={`storyline-${rating}`}
                      value={rating.toString()}
                    >
                      {rating} - {ratingDescriptions[rating]}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Label>World Building</Label>
            <Select
              defaultValue="10"
              value={worldBuildingRating.toString()}
              onValueChange={(value) =>
                setWorldBuildingRating(parseInt(value, 10))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...Array(11).keys()].map((rating) => {
                  return (
                    <SelectItem
                      key={`quality-${rating}`}
                      value={rating.toString()}
                    >
                      {rating} - {ratingDescriptions[rating]}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Label>Illustration</Label>
            <Select
              defaultValue="10"
              value={illustrationRating.toString()}
              onValueChange={(value) =>
                setIllustrationRating(parseInt(value, 10))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...Array(11).keys()].map((rating) => {
                  return (
                    <SelectItem
                      key={`quality-${rating}`}
                      value={rating.toString()}
                    >
                      {rating} - {ratingDescriptions[rating]}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Label>Enjoyment</Label>
            <Select
              defaultValue="10"
              value={enjoymentRating.toString()}
              onValueChange={(value) => setEnjoymentRating(parseInt(value, 10))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...Array(11).keys()].map((rating) => {
                  return (
                    <SelectItem
                      key={`enjoyment-${rating}`}
                      value={rating.toString()}
                    >
                      {rating} - {ratingDescriptions[rating]}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DraftEditor
          editorState={editorState}
          setEditorState={setEditorState}
          mediaType={MEDIA_TYPE.LIGHT_NOVEL}
          mediaId={lightNovelDetail.id}
          setUploadedImages={setUploadedImages}
        />
        <Button type="submit" className="mt-4" onClick={onSubmit}>
          {isLoadingUpdateReview && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit review
        </Button>
      </div>
    </TabsContent>
  );
}
