import { LightNovelDetail, LightNovelReview } from "@/types/lightnovel.type";
import { TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateLightNovelReviewService } from "@/services/lightnovel.service";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDaysIcon, Loader2Icon } from "lucide-react";
import { ContentState, convertToRaw, EditorState } from "draft-js";
import DOMPurify from "dompurify";
import htmlToDraft from "html-to-draftjs";
import { MEDIA_TYPE, PROGRESS_STATUS } from "@/lib/enums";
import "draft-js/dist/Draft.css";
import draftToHtml from "draftjs-to-html";
import { deleteImageService } from "@/services/upload.service";
import { decorator, extractExistingImages } from "@/lib/draft-utils";
import DraftEditor from "@/components/admin/DraftEditor";
import ProgressStatus from "@/components/admin/ProgressStatus";
import RatingSelect from "@/components/admin/RatingSelect";
import MonthPicker from "@/components/ui/month-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

type Props = {
  lightNovelDetail: LightNovelDetail;
  resetParent: () => Promise<void>;
};

export default function ReviewTab({ lightNovelDetail, resetParent }: Props) {
  const toast = useToast();

  let initialEditorState: EditorState;
  let currentImageIds: string[] = [];
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

      currentImageIds = [...extractExistingImages(blocks, contentState)];
    } else {
      initialEditorState = EditorState.createEmpty(decorator);
    }
  } else {
    initialEditorState = EditorState.createEmpty(decorator);
  }

  const [editorState, setEditorState] = useState(initialEditorState);
  const [uploadedImages, setUploadedImages] =
    useState<string[]>(currentImageIds);
  const [progressStatus, setProgressStatus] = useState(
    lightNovelDetail.progressStatus as string
  );
  const [consumedMonth, setConsumedMonth] = useState<Date>(new Date());
  const [storylineRating, setStorylineRating] = useState(
    lightNovelDetail.storylineRating || 10
  );
  const [worldBuildingRating, setWorldBuildingRating] = useState(
    lightNovelDetail.worldBuildingRating || 10
  );
  const [writingStyleRating, setWritingStyleRating] = useState(
    lightNovelDetail.writingStyleRating || 10
  );
  const [charDevelopmentRating, setCharDevelopmentRating] = useState(
    lightNovelDetail.charDevelopmentRating || 10
  );
  const [originalityRating, setOriginalityRating] = useState(
    lightNovelDetail.originalityRating || 10
  );

  const [isLoadingUpdateReview, setIsLoadingUpdateReview] = useState(false);

  const scoringWeight = {
    storylineRating: 0.3,
    worldBuildingRating: 0.25,
    writingStyleRating: 0.2,
    charDevelopmentRating: 0.15,
    originalityRating: 0.1
  };

  const ratingFields = [
    {
      key: "storyline",
      label: "Storyline",
      rating: storylineRating,
      setRating: setStorylineRating
    },
    {
      key: "worldbuilding",
      label: "World Building",
      rating: worldBuildingRating,
      setRating: setWorldBuildingRating
    },
    {
      key: "writingstyle",
      label: "Voice Acting",
      rating: writingStyleRating,
      setRating: setWritingStyleRating
    },
    {
      key: "characterdevelopment",
      label: "Soundtrack Rating",
      rating: charDevelopmentRating,
      setRating: setCharDevelopmentRating
    },
    {
      key: "originality",
      label: "Character Development Rating",
      rating: originalityRating,
      setRating: setOriginalityRating
    }
  ];

  const onSubmit = async () => {
    setIsLoadingUpdateReview(true);

    const rawContentState = convertToRaw(editorState.getCurrentContent());
    const html = draftToHtml(rawContentState);

    const contentState = editorState.getCurrentContent();
    const blocks = contentState.getBlocksAsArray();
    const currentImageIds = extractExistingImages(blocks, contentState);

    const previouslyUploadedImageIds = Object.values(uploadedImages);
    const removedImageIds = previouslyUploadedImageIds.filter(
      (id) => !currentImageIds.includes(id)
    );

    await Promise.all(
      removedImageIds.map((id) => {
        return deleteImageService(id);
      })
    );

    const personalScore =
      storylineRating * scoringWeight.storylineRating +
      worldBuildingRating * scoringWeight.worldBuildingRating +
      writingStyleRating * scoringWeight.writingStyleRating +
      charDevelopmentRating * scoringWeight.charDevelopmentRating +
      originalityRating * scoringWeight.originalityRating;

    const data: LightNovelReview = {
      review: html,
      progressStatus: progressStatus as PROGRESS_STATUS,
      storylineRating,
      worldBuildingRating,
      writingStyleRating,
      charDevelopmentRating,
      originalityRating,
      personalScore
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
      setUploadedImages([...currentImageIds]);
      resetParent();
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
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Label>Progress Status</Label>
              <ProgressStatus
                id={lightNovelDetail.id}
                progressStatus={progressStatus}
                setProgressStatus={setProgressStatus}
              />
            </div>
            <Popover>
              <PopoverTrigger className="self-end pb-2">
                <CalendarDaysIcon />
              </PopoverTrigger>
              <PopoverContent className="w-fit">
                <p className="text-center font-bold">Month completed</p>
                <MonthPicker
                  currentMonth={consumedMonth}
                  onMonthChange={(value) => setConsumedMonth(value)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <RatingSelect ratingFields={ratingFields} />
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
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit review
        </Button>
      </div>
    </TabsContent>
  );
}
