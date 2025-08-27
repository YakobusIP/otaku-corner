import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import { MEDIA_TYPE } from "@/lib/enums";

import { ArrowRightIcon, HeartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Url } from "url";

type Props = {
  cardTitle: string;
  amount: number;
  type: MEDIA_TYPE;
  path: Pick<Url, "pathname" | "query">;
  image: string;
  mediaEnglishTitle: string;
  mediaJapaneseTitle: string;
  topMediaPath: string;
  rating: number | string;
};

export default function HomeCard({
  cardTitle,
  amount,
  type,
  path,
  image,
  mediaEnglishTitle,
  mediaJapaneseTitle,
  topMediaPath,
  rating
}: Props) {
  return (
    <Card className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.03]">
      <CardHeader>
        <CardTitle className="text-slate-800">{cardTitle}</CardTitle>
        <CardDescription>
          <span className="text-4xl font-bold">{amount}</span>{" "}
          {type.toLowerCase()}s
          {type === MEDIA_TYPE.ANIME ? " watched" : " read"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link
          href={path}
          className="inline-flex text-sm text-slate-600 items-center hover:underline hover:underline-offset-4 mb-4"
        >
          View {type.toLowerCase()}s
          <ArrowRightIcon size={14} />
        </Link>

        <Link href={topMediaPath}>
          <div className="relative group cursor-pointer">
            <Image
              src={image}
              alt={`Top ${type}`}
              width={300}
              height={400}
              className="w-full aspect-[3/4] rounded-lg object-cover shadow-lg transition-transform"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-bold text-sm mb-1 line-clamp-2">
                  {mediaEnglishTitle}
                </h3>
                <p className="text-xs opacity-90">{mediaJapaneseTitle}</p>
                <div className="flex items-center mt-2">
                  <HeartIcon
                    size={12}
                    className="text-red-400 fill-red-400 mr-1"
                  />
                  <span className="text-xs">{rating} / 10.00</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
