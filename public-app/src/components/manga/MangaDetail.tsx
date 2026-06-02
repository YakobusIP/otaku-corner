"use client";

import { useState } from "react";

import GeneralFooter from "@/components/GeneralFooter";
import SpoilerWarningModal from "@/components/SpoilerWarningModal";
import HomePublicNavbar from "@/components/home/HomePublicNavbar";
import HeroWallpaper from "@/components/layout/HeroWallpaper";
import MangaDetailReviewTab from "@/components/manga/MangaDetailReviewTab";
import MangaDetailScoresCard from "@/components/manga/MangaDetailScoresCard";
import MangaDetailSynopsisCard from "@/components/manga/MangaDetailSynopsisCard";
import MangaDetailTopSection from "@/components/manga/MangaDetailTopSection";
import SlideUpInView from "@/components/motion/SlideUpInView";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useMangaDetailPage } from "@/hooks/useMangaDetailPage";

import { motion } from "framer-motion";
import { NotepadTextIcon } from "lucide-react";
import { notFound } from "next/navigation";

const slidingTabHighlightTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34
};

const mangaDetailTabTriggerClassName =
  "relative z-10 inline-flex items-center gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-sm font-medium text-slate-600 shadow-none data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none";

type Props = {
  id: number;
};

export default function MangaDetail({ id }: Props) {
  const {
    mangaDetail,
    showSpoilerWarning,
    setShowSpoilerWarning,
    spoilersRevealed,
    setSpoilersRevealed,
    handleRevealSpoilers
  } = useMangaDetailPage(id);
  const [activeTab, setActiveTab] = useState("review");

  if (!mangaDetail) {
    notFound();
  }

  const reviewObject = mangaDetail.review;

  const detailTabs = [
    {
      value: "review",
      label: "My Review",
      Icon: NotepadTextIcon
    }
  ] as const;

  return (
    <HeroWallpaper>
      <HomePublicNavbar />
      <div className="container mx-auto pb-24 sm:pb-28 md:pb-32 lg:pb-36">
        <div className="mb-10 mt-8 flex flex-col gap-6">
          <SlideUpInView className="hidden lg:block">
            <MangaDetailTopSection mangaDetail={mangaDetail} showScoresInGrid />
          </SlideUpInView>

          <SlideUpInView className="lg:hidden">
            <MangaDetailTopSection mangaDetail={mangaDetail} />
          </SlideUpInView>

          <SlideUpInView className="lg:hidden">
            <MangaDetailScoresCard mangaDetail={mangaDetail} />
          </SlideUpInView>

          <SlideUpInView>
            <MangaDetailSynopsisCard synopsis={mangaDetail.synopsis} />
          </SlideUpInView>
        </div>

        <SlideUpInView className="mt-10" eager>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <Card className="rounded-2xl border border-white/50 bg-white/45 shadow-md shadow-rose-100/30 backdrop-blur-md">
              <CardHeader className="border-b border-white/50 pb-0">
                <TabsList className="relative inline-flex h-auto w-fit gap-8 rounded-none border-0 bg-transparent p-0">
                  {detailTabs.map(({ value, label, Icon }) => {
                    const isActive = activeTab === value;

                    return (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className={mangaDetailTabTriggerClassName}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="manga-detail-tab-highlight"
                            initial={false}
                            aria-hidden
                            className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-0.5 rounded-full bg-[#ff6b8b]"
                            transition={slidingTabHighlightTransition}
                          />
                        ) : null}
                        <Icon className="relative z-10 size-4 shrink-0" aria-hidden />
                        <span className="relative z-10">{label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </CardHeader>

              <TabsContent value="review" className="mt-0">
                <MangaDetailReviewTab
                  review={reviewObject}
                  spoilersRevealed={spoilersRevealed}
                  onRevealSpoilers={handleRevealSpoilers}
                />
              </TabsContent>
            </Card>
          </Tabs>
        </SlideUpInView>
      </div>

      <GeneralFooter />
      <SpoilerWarningModal
        showSpoilerWarning={showSpoilerWarning}
        setShowSpoilerWarning={setShowSpoilerWarning}
        setSpoilersRevealed={setSpoilersRevealed}
      />
    </HeroWallpaper>
  );
}
