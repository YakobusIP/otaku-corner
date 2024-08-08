import { MediaType } from "@/enum/general.enum";
import { ChevronRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  cardTitle: string;
  amount: number;
  type: MediaType;
  path: string;
  image: string;
  mediaTitle: string;
  rating: number;
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
        {type.toLowerCase()}s{type === MediaType.ANIME ? " watched" : " read"}
      </p>
      <Link
        to={path}
        className="inline-flex items-center hover:underline hover:underline-offset-4"
      >
        View {type.toLowerCase()}s
        <ChevronRightIcon className="h-4 w-4" />
      </Link>
      <img
        src={image}
        alt="Top Anime"
        width={300}
        height={400}
        className="rounded-lg object-cover"
      />
      <div className="flex flex-col">
        <p className="text-lg font-medium">{mediaTitle}</p>
        <p className="text-muted-foreground">{rating} / 10</p>
      </div>
    </div>
  );
}
