import { MEDIA_TYPE } from "@/lib/enums";

import { ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Url } from "url";

type Props = {
  cardTitle: string;
  amount: number;
  type: MEDIA_TYPE;
  path: Pick<Url, "pathname" | "query">;
  image: string;
  mediaTitle: string;
  rating: number | string;
};

export default function HomeCard({
  cardTitle,
  amount,
  type,
  path,
  image,
  mediaTitle,
  rating
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <h2>{cardTitle}</h2>
      <p className="text-muted-foreground">
        <span className="text-4xl font-bold">{amount}</span>{" "}
        {type.toLowerCase()}s{type === MEDIA_TYPE.ANIME ? " watched" : " read"}
      </p>
      <Link
        href={path}
        className="inline-flex items-center hover:underline hover:underline-offset-4"
      >
        View {type.toLowerCase()}s
        <ChevronRightIcon className="h-4 w-4" />
      </Link>
      <Image
        src={image}
        alt="Top Anime"
        width={300}
        height={400}
        className="aspect-[3/4] rounded-lg object-cover"
      />
      <div className="flex flex-col">
        <p className="text-lg font-medium">{mediaTitle}</p>
        <p className="text-muted-foreground">{rating} / 10</p>
      </div>
    </div>
  );
}
