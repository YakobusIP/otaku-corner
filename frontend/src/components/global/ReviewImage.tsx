import { ContentState } from "draft-js";
import { ReactNode } from "react";

type Props = {
  contentState: ContentState;
  children: ReactNode;
  entityKey: string;
};

export default function ReviewImage({
  contentState,
  children,
  entityKey
}: Props) {
  const entity = contentState.getEntity(entityKey);
  const { src } = entity.getData();

  return (
    <figure>
      <img src={src} className="max-w-[300px] w-full h-auto block mx-auto" />
      {children}
    </figure>
  );
}
