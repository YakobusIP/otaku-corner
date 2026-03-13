import AnimeHeader from "@/components/anime/AnimeHeader";
import AnimeListSection from "@/components/anime/AnimeListSection";
import { AnimeProvider } from "@/components/context/AnimeContext";

export default function AnimeList() {
  return (
    <AnimeProvider>
      <div className="space-y-4 md:space-y-6">
        {/* Header with Media Type Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
                Media Review Dashboard
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Manage your anime, manga, and light novel reviews
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <AnimeHeader />
        </div>

        <AnimeListSection />
      </div>
    </AnimeProvider>
  );
}
