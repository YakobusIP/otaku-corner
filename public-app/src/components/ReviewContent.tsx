"use client";

import MDEditor from "@uiw/react-md-editor";

type Props = {
  review?: string;
};

export default function ReviewContent({ review }: Props) {
  return (
    <div data-color-mode="light">
      <style>
        {`.wmde-markdown img {
            display: block;
            width: 40%;
            margin: 0 auto;
          }`}
      </style>
      <MDEditor.Markdown source={review} style={{ whiteSpace: "pre-line" }} />
    </div>
  );
}
