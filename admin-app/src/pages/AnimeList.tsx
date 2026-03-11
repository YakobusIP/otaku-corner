import AnimeHeader from "@/components/anime/AnimeHeader";
import AnimeListSection from "@/components/anime/AnimeListSection";

export default function AnimeList() {
  return (
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

          {/* <AddMediaModal onAddMedia={handleAddMedia}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add Media
            </Button>
          </AddMediaModal> */}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <AnimeHeader />
      </div>

      <AnimeListSection />
    </div>
  );
}
