import { Loader2Icon } from "lucide-react";
import Image from "next/image";

export default function LoadingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center gap-4">
      <Image
        src="/loading.gif"
        alt="Loading data"
        width={128}
        height={128}
        className="w-32 h-32 rounded-xl"
        unoptimized
      />
      <div className="flex flex-col items-center justify-center gap-2 xl:gap-4">
        <div className="flex items-center justify-center gap-2">
          <Loader2Icon className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
          <h2>Loading...</h2>
        </div>
        <h4 className="text-muted-foreground text-center">
          Please wait while we fetch your content.
        </h4>
      </div>
    </div>
  );
}
