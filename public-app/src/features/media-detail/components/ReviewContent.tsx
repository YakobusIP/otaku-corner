"use client";

import MDEditor from "@uiw/react-md-editor";

type Props = {
  review?: string;
  spoilersRevealed?: boolean;
};

export default function ReviewContent({
  review,
  spoilersRevealed = false
}: Props) {
  return (
    <div data-color-mode="light" className={!spoilersRevealed ? "blur-sm" : ""}>
      <style>
        {`
          ol {
            list-style: decimal;
          }

          ul {
            list-style: disc;
          }
            
          .wmde-markdown img {
            display: block;
            width: 40%;
            margin: 0 auto;
          }

          @media (max-width: 1280px) {
            .wmde-markdown img {
              width: 50%;
            }
          }

          @media (max-width: 768px) {
            .wmde-markdown img {
              width: 70%;
            }
          }

          @media (max-width: 480px) {
            .wmde-markdown img {
              width: 100%;
            }
          }
          
          .wmde-markdown table {
            display: table;
            width: 100%;
            overflow: visible;
            clear: none;
            margin-top: 0;
          }
          `}
      </style>
      <MDEditor.Markdown
        source={review}
        style={{ backgroundColor: "transparent", textAlign: "justify" }}
      />
    </div>
  );
}
