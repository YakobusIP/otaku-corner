import { MangaDetail, MangaReview } from "@/types/manga.type";
import { TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateMangaReviewService } from "@/services/manga.service";
import { useToast } from "@/components/ui/use-toast";
import { CalendarDaysIcon, Loader2Icon } from "lucide-react";
import { decorator, extractExistingImages } from "@/lib/draft-utils";
import { ContentState, convertToRaw, EditorState } from "draft-js";
import { MEDIA_TYPE, PROGRESS_STATUS } from "@/lib/enums";
import "draft-js/dist/Draft.css";
import DOMPurify from "dompurify";
import htmlToDraft from "html-to-draftjs";
import { deleteImageService } from "@/services/upload.service";
import draftToHtml from "draftjs-to-html";
import DraftEditor from "@/components/admin/DraftEditor";
import ProgressStatus from "@/components/admin/ProgressStatus";
import RatingSelect from "@/components/admin/RatingSelect";
import MonthPicker from "@/components/ui/month-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { createUTCDate } from "@/lib/utils";

type Props = {
  mangaDetail: MangaDetail;
  resetParent: () => Promise<void>;
};

export default function ReviewTab({ mangaDetail, resetParent }: Props) {
  const toast = useToast();

  let initialEditorState: EditorState;
  let currentImageIds: string[] = [];
  if (mangaDetail.review) {
    const sanitizedHTML = DOMPurify.sanitize(mangaDetail.review);
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
    mangaDetail.progressStatus as string
  );
  const [consumedMonth, setConsumedMonth] = useState<Date | null>(
    mangaDetail.consumedAt ? new Date(mangaDetail.consumedAt) : null
  );
  const [storylineRating, setStorylineRating] = useState(
    mangaDetail.storylineRating || 10
  );
  const [artStyleRating, setArtStyleRating] = useState(
    mangaDetail.artStyleRating || 10
  );
  const [charDevelopmentRating, setCharDevelopmentRating] = useState(
    mangaDetail.charDevelopmentRating || 10
  );
  const [worldBuildingRating, setWorldBuildingRating] = useState(
    mangaDetail.worldBuildingRating || 10
  );
  const [originalityRating, setOriginalityRating] = useState(
    mangaDetail.originalityRating || 10
  );

  const [isLoadingUpdateReview, setIsLoadingUpdateReview] = useState(false);

  const scoringWeight = {
    storylineRating: 0.3,
    artStyleRating: 0.25,
    charDevelopmentRating: 0.2,
    worldBuildingRating: 0.15,
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
      key: "artstyle",
      label: "Art Style",
      rating: artStyleRating,
      setRating: setArtStyleRating
    },
    {
      key: "characterdevelopment",
      label: "Character Development",
      rating: charDevelopmentRating,
      setRating: setCharDevelopmentRating
    },
    {
      key: "worldbuilding",
      label: "World Building",
      rating: worldBuildingRating,
      setRating: setWorldBuildingRating
    },
    {
      key: "originality",
      label: "Originality",
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
      artStyleRating * scoringWeight.artStyleRating +
      charDevelopmentRating * scoringWeight.charDevelopmentRating +
      worldBuildingRating * scoringWeight.worldBuildingRating +
      originalityRating * scoringWeight.originalityRating;

    const adjustedConsumedMonth = consumedMonth
      ? createUTCDate(
          consumedMonth.getUTCFullYear(),
          consumedMonth.getUTCMonth()
        )
      : null;

    const data: MangaReview = {
      review: html,
      progressStatus: progressStatus as PROGRESS_STATUS,
      consumedAt: adjustedConsumedMonth,
      storylineRating,
      artStyleRating,
      charDevelopmentRating,
      worldBuildingRating,
      originalityRating,
      personalScore
    };
    const response = await updateMangaReviewService(mangaDetail.id, data);
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
                id={mangaDetail.id}
                progressStatus={progressStatus}
                setProgressStatus={setProgressStatus}
              />
            </div>
            <Popover>
              <PopoverTrigger className="self-end pb-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <CalendarDaysIcon
                        className={
                          consumedMonth ? "text-green-600" : "text-red-600"
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {consumedMonth ? (
                        <p>
                          Consumed at{" "}
                          {consumedMonth.toLocaleString("default", {
                            month: "long"
                          })}{" "}
                          {consumedMonth.getUTCFullYear()}
                        </p>
                      ) : (
                        <p>Consumed date is not set</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </PopoverTrigger>
              <PopoverContent className="w-fit">
                <p className="text-center font-bold">Month consumed</p>
                <MonthPicker
                  currentMonth={
                    consumedMonth ||
                    createUTCDate(
                      new Date().getUTCFullYear(),
                      new Date().getUTCMonth()
                    )
                  }
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
          mediaType={MEDIA_TYPE.MANGA}
          mediaId={mangaDetail.id}
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
