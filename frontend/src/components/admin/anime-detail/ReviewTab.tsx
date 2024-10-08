import { AnimeDetail, AnimeReview } from "@/types/anime.type";
import { TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateAnimeReviewService } from "@/services/anime.service";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { MEDIA_TYPE, PROGRESS_STATUS } from "@/lib/enums";
import "draft-js/dist/Draft.css";
import DraftEditor from "@/components/admin/DraftEditor";
import { ContentState, convertToRaw, EditorState } from "draft-js";
import DOMPurify from "dompurify";
import htmlToDraft from "html-to-draftjs";
import { decorator, extractExistingImages } from "@/lib/draft-utils";
import draftToHtml from "draftjs-to-html";
import { deleteImageService } from "@/services/upload.service";
import RatingSelect from "@/components/admin/RatingSelect";
import ProgressStatus from "@/components/admin/ProgressStatus";
import { Label } from "@/components/ui/label";

type Props = {
  animeDetail: AnimeDetail;
  resetParent: () => Promise<void>;
};

export default function ReviewTab({ animeDetail, resetParent }: Props) {
  const toast = useToast();

  let initialEditorState: EditorState;
  let currentImageIds: string[] = [];
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
    animeDetail.progressStatus as string
  );
  const [storylineRating, setStorylineRating] = useState(
    animeDetail.storylineRating || 10
  );
  const [qualityRating, setQualityRating] = useState(
    animeDetail.qualityRating || 10
  );
  const [voiceActingRating, setVoiceActingRating] = useState(
    animeDetail.voiceActingRating || 10
  );
  const [soundTrackRating, setSoundTrackRating] = useState(
    animeDetail.soundTrackRating || 10
  );
  const [charDevelopmentRating, setCharDevelopmentRating] = useState(
    animeDetail.charDevelopmentRating || 10
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

  const scoringWeight = {
    storylineRating: 0.3,
    qualityRating: 0.25,
    voiceActingRating: 0.2,
    soundTrackRating: 0.15,
    charDevelopmentRating: 0.1
  };

  const ratingFields = [
    {
      key: "storyline",
      label: "Storyline",
      rating: storylineRating,
      setRating: setStorylineRating
    },
    {
      key: "quality",
      label: "Animation Quality",
      rating: qualityRating,
      setRating: setQualityRating
    },
    {
      key: "voiceacting",
      label: "Voice Acting",
      rating: voiceActingRating,
      setRating: setVoiceActingRating
    },
    {
      key: "soundtrack",
      label: "Soundtrack",
      rating: soundTrackRating,
      setRating: setSoundTrackRating
    },
    {
      key: "characterdevelopment",
      label: "Character Development",
      rating: charDevelopmentRating,
      setRating: setCharDevelopmentRating
    }
  ];

  const handleSubmit = async () => {
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
      qualityRating * scoringWeight.qualityRating +
      voiceActingRating * scoringWeight.voiceActingRating +
      soundTrackRating * scoringWeight.soundTrackRating +
      charDevelopmentRating * scoringWeight.charDevelopmentRating;

    const data: AnimeReview = {
      review: html,
      progressStatus: progressStatus as PROGRESS_STATUS,
      storylineRating,
      qualityRating,
      voiceActingRating,
      soundTrackRating,
      charDevelopmentRating,
      personalScore
    };
    const response = await updateAnimeReviewService(animeDetail.id, data);
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
          <div className="flex flex-col gap-2">
            <Label>Progress Status</Label>
            <ProgressStatus
              id={animeDetail.id}
              progressStatus={progressStatus}
              setProgressStatus={setProgressStatus}
            />
          </div>
          <RatingSelect
            ratingFields={ratingFields}
            ratingDescriptions={ratingDescriptions}
          />
        </div>
        <DraftEditor
          editorState={editorState}
          setEditorState={setEditorState}
          mediaType={MEDIA_TYPE.ANIME}
          mediaId={animeDetail.id}
          setUploadedImages={setUploadedImages}
        />
        <Button type="submit" className="mt-4" onClick={handleSubmit}>
          {isLoadingUpdateReview && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit review
        </Button>
      </div>
    </TabsContent>
  );
}
