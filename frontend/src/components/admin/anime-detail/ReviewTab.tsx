import { AnimeDetail, AnimeReview } from "@/types/anime.type";
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
import { updateAnimeReviewService } from "@/services/anime.service";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { BLOCK_TYPES, MEDIA_TYPE } from "@/lib/enums";
import "draft-js/dist/Draft.css";
import DraftEditor from "../DraftEditor";
import { ContentState, convertToRaw, EditorState } from "draft-js";
import DOMPurify from "dompurify";
import htmlToDraft from "html-to-draftjs";
import { decorator } from "@/lib/draft-utils";
import draftToHtml from "draftjs-to-html";
import { deleteImageService } from "@/services/upload.service";

type Props = {
  animeDetail: AnimeDetail;
};

export default function ReviewTab({ animeDetail }: Props) {
  const toast = useToast();

  let initialEditorState: EditorState;
  if (animeDetail.review) {
    const sanitizedHTML = DOMPurify.sanitize(animeDetail.review);
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
    } else {
      initialEditorState = EditorState.createEmpty(decorator);
    }
  } else {
    initialEditorState = EditorState.createEmpty(decorator);
  }

  const [editorState, setEditorState] = useState(initialEditorState);
  const [uploadedImages, setUploadedImages] = useState<{
    [key: string]: number;
  }>({});
  const [storylineRating, setStorylineRating] = useState(
    animeDetail.storylineRating || 10
  );
  const [qualityRating, setQualityRating] = useState(
    animeDetail.qualityRating || 10
  );
  const [voiceActingRating, setVoiceActingRating] = useState(
    animeDetail.voiceActingRating || 10
  );
  const [enjoymentRating, setEnjoymentRating] = useState(
    animeDetail.enjoymentRating || 10
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
    const currentImageUrls: string[] = [];

    blocks.forEach((block) => {
      if (block.getType() === BLOCK_TYPES.IMAGE) {
        const entityKey = block.getEntityAt(0);
        if (entityKey) {
          const entity = contentState.getEntity(entityKey);
          const { src } = entity.getData();
          currentImageUrls.push(src);
        }
      }
    });

    const previouslyUploadedImageIds = Object.values(uploadedImages);
    console.log(
      "🚀 ~ onSubmit ~ previouslyUploadedImageIds:",
      previouslyUploadedImageIds
    );
    const currentImageIds = currentImageUrls.map((url) => uploadedImages[url]);
    console.log("🚀 ~ onSubmit ~ currentImageIds:", currentImageIds);
    const removedImageIds = previouslyUploadedImageIds.filter(
      (id) => !currentImageIds.includes(id)
    );
    console.log("🚀 ~ onSubmit ~ removedImageIds:", removedImageIds);

    await Promise.all(
      removedImageIds.map((id) => {
        return deleteImageService(id);
      })
    );

    const data: AnimeReview = {
      review: html,
      storylineRating,
      qualityRating,
      voiceActingRating,
      enjoymentRating,
      personalScore:
        (storylineRating +
          qualityRating +
          voiceActingRating +
          enjoymentRating) /
        4
    };
    const response = await updateAnimeReviewService(animeDetail.id, data);
    if (response.success) {
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
      setUploadedImages({});
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
            <Label>Animation Quality</Label>
            <Select
              defaultValue="10"
              value={qualityRating.toString()}
              onValueChange={(value) => setQualityRating(parseInt(value, 10))}
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
            <Label>Voice Acting</Label>
            <Select
              defaultValue="10"
              value={voiceActingRating.toString()}
              onValueChange={(value) =>
                setVoiceActingRating(parseInt(value, 10))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...Array(11).keys()].map((rating) => {
                  return (
                    <SelectItem
                      key={`voiceacting-${rating}`}
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
          mediaType={MEDIA_TYPE.ANIME}
          mediaId={animeDetail.id}
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
