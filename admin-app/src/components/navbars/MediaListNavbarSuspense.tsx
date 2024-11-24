import { Skeleton } from "@/components/ui/skeleton";

import useWideScreen from "@/hooks/useWideScreen";

export default function MediaListNavbarSuspense() {
  const isWideScreen = useWideScreen();

  return isWideScreen ? (
    <header className="flex items-center bg-background border-b">
      <Skeleton className="w-32 mt-0 ml-2 h-[40px]" />
      <div className="flex items-center justify-between w-full p-3 xl:pl-2 xl:pr-4 xl:py-4">
        <div className="flex flex-col xl:flex-row items-center w-full gap-4">
          <div className="flex w-full xl:w-fit gap-2 xl:gap-4">
            <Skeleton className="w-[300px] h-[40px]" />
            <Skeleton className="w-[100px] h-[40px]" />
          </div>
          <Skeleton className="w-[150px] h-[40px]" />
          <Skeleton className="w-[150px] h-[40px]" />
          <Skeleton className="w-[150px] h-[40px]" />
          <Skeleton className="w-[150px] h-[40px]" />
          <Skeleton className="w-[150px] h-[40px]" />
          <Skeleton className="w-[150px] h-[40px]" />
        </div>
        <Skeleton className="w-[150px] h-[40px]" />
      </div>
    </header>
  ) : (
    <header className="flex items-center justify-between bg-background border-b p-2 gap-2">
      <Skeleton className="h-[40px] aspect-square" />
      <div className="flex w-full xl:w-fit gap-2 xl:gap-4">
        <Skeleton className="w-full h-[40px]" />
        <Skeleton className="h-[40px] aspect-square" />
      </div>
    </header>
  );
}
