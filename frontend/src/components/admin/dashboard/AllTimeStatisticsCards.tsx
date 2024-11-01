import { AllTimeStatistic } from "@/types/statistic.type";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAllTimeStatisticService } from "@/services/statistic.service";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AllTimeStatisticsCards() {
  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const [allTimeStatistic, setAllTimeStatistic] = useState<AllTimeStatistic>();
  const [isLoadingAllTimeStatistic, setIsLoadingAllTimeStatistic] =
    useState(false);

  const fetchMediaConsumptionData = useCallback(async () => {
    setIsLoadingAllTimeStatistic(true);
    const response = await fetchAllTimeStatisticService();
    if (response.success) {
      setAllTimeStatistic(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAllTimeStatistic(false);
  }, []);

  useEffect(() => {
    fetchMediaConsumptionData();
  }, [fetchMediaConsumptionData]);

  return (
    <div className="grid grid-cols-1 grid-rows-4 xl:grid-cols-2 xl:grid-rows-2 2xl:grid-cols-4 2xl:grid-rows-1 gap-4 w-full xl:w-fit">
      {!isLoadingAllTimeStatistic && allTimeStatistic ? (
        <>
          <Card className="w-full xl:w-[250px] h-[180px]">
            <CardHeader>
              <CardTitle>Anime Count</CardTitle>
              <CardDescription>Lifetime anime watched</CardDescription>
            </CardHeader>
            <CardContent>
              <h1>{allTimeStatistic.animeCount}</h1>
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[250px] h-[180px]">
            <CardHeader>
              <CardTitle>Manga Count</CardTitle>
              <CardDescription>Lifetime manga read</CardDescription>
            </CardHeader>
            <CardContent>
              <h1>{allTimeStatistic.mangaCount}</h1>
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[250px] h-[180px]">
            <CardHeader>
              <CardTitle>Light Novel Count</CardTitle>
              <CardDescription>Lifetime light novel read</CardDescription>
            </CardHeader>
            <CardContent>
              <h1>{allTimeStatistic.lightNovelCount}</h1>
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[250px] h-[180px]">
            <CardHeader>
              <CardTitle>Average Score</CardTitle>
              <CardDescription>Lifetime average personal score</CardDescription>
            </CardHeader>
            <CardContent>
              <h1>{allTimeStatistic.averagePersonalScore.toFixed(2)}</h1>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className="w-full xl:w-[250px] h-[180px]">
            <CardHeader>
              <Skeleton className="h-[25px] w-[120px]" />
              <Skeleton className="h-[20px] w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[50px] w-[90px]" />
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[250px] h-[180px]">
            <CardHeader>
              <Skeleton className="h-[25px] w-[120px]" />
              <Skeleton className="h-[20px] w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[50px] w-[90px]" />
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[250px] h-[180px]">
            <CardHeader>
              <Skeleton className="h-[25px] w-[120px]" />
              <Skeleton className="h-[20px] w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[50px] w-[90px]" />
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[250px] h-[180px]">
            <CardHeader>
              <Skeleton className="h-[25px] w-[120px]" />
              <Skeleton className="h-[20px] w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[50px] w-[90px]" />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
