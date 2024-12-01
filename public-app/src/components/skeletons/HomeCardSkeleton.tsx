import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  cardTitle: string;
};

export default function HomeCardSkeleton({ cardTitle }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <h2>{cardTitle}</h2>
      <Skeleton className="h-[41px] w-64" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="w-[300px] h-[400px]" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}
