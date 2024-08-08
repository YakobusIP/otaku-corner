import { AnimeDetail, AnimeReview } from "@/types/anime.type";
import { TabsContent } from "@/components/ui/tabs";
import { useState, KeyboardEvent, useCallback, useMemo } from "react";
import { createEditor, Descendant } from "slate";
import {
  Slate,
  Editable,
  withReact,
  RenderLeafProps,
  RenderElementProps
} from "slate-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { withHistory } from "slate-history";
import { CustomEditor } from "@/lib/custom-editor";
import ReviewToolbar from "./ReviewToolbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateAnimeReviewService } from "@/services/anime.service";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { serializeNodes, deserialize } from "@/lib/html-serializer";

type Props = {
  animeDetail: AnimeDetail;
};

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }]
  }
];

export default function ReviewTab({ animeDetail }: Props) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const toast = useToast();

  const [review, setReview] = useState(animeDetail.review?.review || "");
  const [storylineRating, setStorylineRating] = useState(
    animeDetail.review?.storylineRating || 10
  );
  const [qualityRating, setQualityRating] = useState(
    animeDetail.review?.qualityRating || 10
  );
  const [voiceActingRating, setVoiceActingRating] = useState(
    animeDetail.review?.voiceActingRating || 10
  );
  const [enjoymentRating, setEnjoymentRating] = useState(
    animeDetail.review?.enjoymentRating || 10
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

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) {
      switch (event.key) {
        case "Enter": {
          event.preventDefault();
          CustomEditor.handleEnterKey(editor, event.nativeEvent);
          return;
        }
      }
    } else {
      switch (event.key) {
        case "b": {
          event.preventDefault();
          CustomEditor.toggleMark(editor, "bold");
          return;
        }

        case "i": {
          event.preventDefault();
          CustomEditor.toggleMark(editor, "italic");
          return;
        }

        case "u": {
          event.preventDefault();
          CustomEditor.toggleMark(editor, "underline");
          return;
        }
      }
    }
  };

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const { attributes, children, leaf } = props;
    if (leaf.bold) {
      return <strong {...attributes}>{children}</strong>;
    }

    if (leaf.italic) {
      return <em {...attributes}>{children}</em>;
    }

    if (leaf.underline) {
      return <u {...attributes}>{children}</u>;
    }

    return <span {...attributes}>{props.children}</span>;
  }, []);

  const renderElement = useCallback((props: RenderElementProps) => {
    const { element, attributes, children } = props;
    switch (element.type) {
      case "heading-one":
        return (
          <h1 {...attributes} style={{ fontSize: "24px", lineHeight: "32px" }}>
            {children}
          </h1>
        );
      case "heading-two":
        return (
          <h2 {...attributes} style={{ fontSize: "20px", lineHeight: "28px" }}>
            {children}
          </h2>
        );
      case "heading-three":
        return (
          <h3 {...attributes} style={{ fontSize: "18px", lineHeight: "28px" }}>
            {children}
          </h3>
        );
      case "list-item":
        return <li {...attributes}>{children}</li>;
      case "ordered-list":
        return (
          <ol
            {...attributes}
            style={{
              listStyle: "revert",
              listStyleType: "decimal",
              listStylePosition: "inside"
            }}
          >
            {children}
          </ol>
        );
      case "unordered-list":
        return (
          <ul
            {...attributes}
            style={{
              listStyle: "revert",
              listStyleType: "disc",
              listStylePosition: "inside"
            }}
          >
            {children}
          </ul>
        );
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  const onSubmit = async () => {
    setIsLoadingUpdateReview(true);
    const data: AnimeReview = {
      review,
      storylineRating,
      qualityRating,
      voiceActingRating,
      enjoymentRating
    };
    const response = await updateAnimeReviewService(animeDetail.id, data);
    if (response.success) {
      toast.toast({
        title: "All set!",
        description: response.data.message
      });
    } else {
      toast.toast({
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
        <div className="flex flex-col lg:flex-row items-center gap-4 mb-4">
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
        <Slate
          editor={editor}
          initialValue={
            animeDetail.review
              ? (deserialize(
                  new DOMParser().parseFromString(
                    animeDetail.review.review,
                    "text/html"
                  ).body
                ) as Descendant[])
              : initialValue
          }
          onChange={(value) => {
            const isAstChange = editor.operations.some(
              (op) => "set_selection" !== op.type
            );

            if (isAstChange) {
              setReview(serializeNodes(value));
            }
          }}
        >
          <ReviewToolbar />
          <Editable
            placeholder="Enter review here..."
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            onKeyDown={onKeyDown}
            className="border border-b-black border-x-black p-1 focus:outline-none"
          />
        </Slate>
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
