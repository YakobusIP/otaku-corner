import { useCallback, useEffect, useRef, useState } from "react";

import { fetchAllTimeStatisticService } from "@/services/statistic.service";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useToast } from "@/hooks/useToast";

import { AllTimeStatistic } from "@/types/statistic.type";

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
    <div className="grid grid-cols-1 grid-rows-6 xl:grid-cols-2 xl:grid-rows-3-auto gap-4 w-full xl:w-fit">
      {!isLoadingAllTimeStatistic && allTimeStatistic ? (
        <>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <CardTitle>Total Media Count</CardTitle>
              <CardDescription>Lifetime media consumed</CardDescription>
            </CardHeader>
            <CardContent>
              <h2>{allTimeStatistic.allMediaCount}</h2>
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <CardTitle>Anime Count</CardTitle>
              <CardDescription>Lifetime anime watched</CardDescription>
            </CardHeader>
            <CardContent>
              <h2>{allTimeStatistic.animeCount}</h2>
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <CardTitle>Manga Count</CardTitle>
              <CardDescription>Lifetime manga read</CardDescription>
            </CardHeader>
            <CardContent>
              <h2>{allTimeStatistic.mangaCount}</h2>
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <CardTitle>Light Novel Count</CardTitle>
              <CardDescription>Lifetime light novel read</CardDescription>
            </CardHeader>
            <CardContent>
              <h2>{allTimeStatistic.lightNovelCount}</h2>
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <CardTitle>Average MAL Score</CardTitle>
              <CardDescription>
                Average MAL scores of added media
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h2>{allTimeStatistic.averageMalScore.toFixed(2)}</h2>
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <CardTitle>Average Personal Score</CardTitle>
              <CardDescription>Lifetime average personal score</CardDescription>
            </CardHeader>
            <CardContent>
              <h2>{allTimeStatistic.averagePersonalScore.toFixed(2)}</h2>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <Skeleton className="h-[25px] w-[120px]" />
              <Skeleton className="h-[20px] w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[35px] w-[90px]" />
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <Skeleton className="h-[25px] w-[120px]" />
              <Skeleton className="h-[20px] w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[35px] w-[90px]" />
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <Skeleton className="h-[25px] w-[120px]" />
              <Skeleton className="h-[20px] w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[35px] w-[90px]" />
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <Skeleton className="h-[25px] w-[120px]" />
              <Skeleton className="h-[20px] w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[35px] w-[90px]" />
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <Skeleton className="h-[25px] w-[120px]" />
              <Skeleton className="h-[20px] w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[35px] w-[90px]" />
            </CardContent>
          </Card>
          <Card className="w-full xl:w-[300px]">
            <CardHeader>
              <Skeleton className="h-[25px] w-[120px]" />
              <Skeleton className="h-[20px] w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[35px] w-[90px]" />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
