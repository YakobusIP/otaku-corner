import { useToast } from "@/components/ui/use-toast";
import { fetchLightNovelByIdService } from "@/services/lightnovel.service";
import { type LightNovelDetail } from "@/types/lightnovel.type";
import { Loader2, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AboutTab from "@/components/admin/lightnovel-detail/AboutTab";
import ReviewTab from "@/components/admin/lightnovel-detail/ReviewTab";

export default function AdminLightNovelDetail() {
  const [lightNovelDetail, setLightNovelDetail] = useState<LightNovelDetail>();
  const [isLoadingLightNovelDetail, setIsLoadingLightNovelDetail] =
    useState(false);
  const { lightNovelId } = useParams();

  const toast = useToast();
  const toastRef = useRef(toast.toast);

  const fetchLightNovelById = useCallback(async () => {
    setIsLoadingLightNovelDetail(true);
    const response = await fetchLightNovelByIdService(lightNovelId as string);
    if (response.success) {
      setLightNovelDetail(response.data);
    } else {
      toastRef.current({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: response.error
      });
    }
    setIsLoadingLightNovelDetail(false);
  }, [lightNovelId]);

  useEffect(() => {
    fetchLightNovelById();
  }, [fetchLightNovelById]);

  return !isLoadingLightNovelDetail && lightNovelDetail ? (
    <div className="flex flex-col min-h-[100dvh]">
      <Link to="/admin">
        <Button variant="outline" className="absolute top-4 left-4">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to list
        </Button>
      </Link>
      <header className="w-full bg-gradient-to-b xl:bg-gradient-to-r from-primary to-muted-foreground pt-20 pb-12 xl:py-12 px-4">
        <div className="container mx-auto flex flex-col xl:flex-row gap-6 items-center">
          <img
            src={lightNovelDetail.images.large_image_url ?? "/placeholder.svg"}
            width={300}
            height={400}
            alt="LightNovel Cover"
            className="rounded-xl"
          />
          <div className="flex flex-col gap-4">
            <h1 className="text-white">{lightNovelDetail.title}</h1>
            <p className="text-lg text-white/80 whitespace-pre-line">
              {lightNovelDetail.synopsis}
            </p>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 xl:py-12 px-8 xl:px-6">
        <Tabs defaultValue="about">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <AboutTab lightNovelDetail={lightNovelDetail} />
          <ReviewTab lightNovelDetail={lightNovelDetail} />
        </Tabs>
      </main>
    </div>
  ) : (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center gap-4">
      <img src="/loading.gif" className="w-32 h-32 rounded-xl" />
      <div className="flex items-center justify-center gap-2 xl:gap-4">
        <Loader2 className="w-8 h-8 xl:w-16 xl:h-16 animate-spin" />
        <h2>Fetching light novel details...</h2>
      </div>
    </div>
  );
}
