import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import AuthorConsumptionChart from "@/components/admin/dashboard/AuthorConsumptionChart";
import GenreConsumptionChart from "@/components/admin/dashboard/GenreConsumptionChart";
import StudioConsumptionChart from "@/components/admin/dashboard/StudioConsumptionChart";
import ThemeConsumptionChart from "@/components/admin/dashboard/ThemeConsumptionChart";
import { ENTITY_TYPE } from "@/lib/enums";
import {
  fetchAuthorConsumptionService,
  fetchGenreConsumptionService,
  fetchStudioConsumptionService,
  fetchThemeConsumptionService
} from "@/services/statistic.service";
import {
  AuthorConsumption,
  GenreConsumption,
  StudioConsumption,
  ThemeConsumption
} from "@/types/statistic.type";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function EntityConsumptionCard() {
  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const [activeChart, setActiveChart] = useState(ENTITY_TYPE.GENRE);
  const [genreConsumption, setGenreConsumption] = useState<GenreConsumption[]>(
    []
  );
  const [studioConsumption, setStudioConsumption] = useState<
    StudioConsumption[]
  >([]);
  const [themeConsumption, setThemeConsumption] = useState<ThemeConsumption[]>(
    []
  );
  const [authorConsumption, setAuthorConsumption] = useState<
    AuthorConsumption[]
  >([]);
  const [isLoadingGenreConsumption, setIsLoadingGenreConsumption] =
    useState(false);
  const [isLoadingThemeConsumption, setIsLoadingThemeConsumption] =
    useState(false);
  const [isLoadingStudioConsumption, setIsLoadingStudioConsumption] =
    useState(false);
  const [isLoadingAuthorConsumption, setIsLoadingAuthorConsumption] =
    useState(false);

  const fetchGenreConsumptionData = useCallback(async () => {
    setIsLoadingGenreConsumption(true);
    const response = await fetchGenreConsumptionService();
    if (response.success) {
      setGenreConsumption(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingGenreConsumption(false);
  }, []);

  const fetchStudioConsumptionData = useCallback(async () => {
    setIsLoadingStudioConsumption(true);
    const response = await fetchStudioConsumptionService();
    if (response.success) {
      setStudioConsumption(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingStudioConsumption(false);
  }, []);

  const fetchThemeConsumptionData = useCallback(async () => {
    setIsLoadingThemeConsumption(true);
    const response = await fetchThemeConsumptionService();
    if (response.success) {
      setThemeConsumption(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingThemeConsumption(false);
  }, []);

  const fetchAuthorConsumptionData = useCallback(async () => {
    setIsLoadingAuthorConsumption(true);
    const response = await fetchAuthorConsumptionService();
    if (response.success) {
      setAuthorConsumption(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingAuthorConsumption(false);
  }, []);

  useEffect(() => {
    switch (activeChart) {
      case ENTITY_TYPE.GENRE:
        fetchGenreConsumptionData();
        break;
      case ENTITY_TYPE.STUDIO:
        fetchStudioConsumptionData();
        break;
      case ENTITY_TYPE.THEME:
        fetchThemeConsumptionData();
        break;
      case ENTITY_TYPE.AUTHOR:
        fetchAuthorConsumptionData();
        break;
    }
  }, [
    activeChart,
    fetchGenreConsumptionData,
    fetchStudioConsumptionData,
    fetchThemeConsumptionData,
    fetchAuthorConsumptionData
  ]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-stretch justify-between space-y-0 p-0 2xl:flex-row">
        <div className="flex flex-col justify-center gap-1 px-6 py-5 2xl:py-6">
          <CardTitle>{activeChart} Consumption</CardTitle>
          <CardDescription>
            Top 10 {activeChart.toLowerCase()} medias consumed over the years
          </CardDescription>
        </div>
        <div className="flex items-center justify-center gap-4 px-6 py-2 2xl:py-6">
          <Label>Entity Type</Label>
          <Select
            defaultValue={ENTITY_TYPE.GENRE}
            value={activeChart}
            onValueChange={(value) => setActiveChart(value as ENTITY_TYPE)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ENTITY_TYPE).map((rating) => {
                return (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {activeChart === ENTITY_TYPE.GENRE && (
          <GenreConsumptionChart
            isLoading={isLoadingGenreConsumption}
            data={genreConsumption}
          />
        )}
        {activeChart === ENTITY_TYPE.STUDIO && (
          <StudioConsumptionChart
            isLoading={isLoadingStudioConsumption}
            data={studioConsumption}
          />
        )}
        {activeChart === ENTITY_TYPE.THEME && (
          <ThemeConsumptionChart
            isLoading={isLoadingThemeConsumption}
            data={themeConsumption}
          />
        )}
        {activeChart === ENTITY_TYPE.AUTHOR && (
          <AuthorConsumptionChart
            isLoading={isLoadingAuthorConsumption}
            data={authorConsumption}
          />
        )}
      </CardContent>
    </Card>
  );
}
