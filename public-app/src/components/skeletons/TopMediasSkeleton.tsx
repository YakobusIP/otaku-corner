import HomeCardSkeleton from "@/components/skeletons/HomeCardSkeleton";

export default function TopMediasSkeleton() {
  return (
    <section className="py-12 md:py-16 xl:py-20">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <HomeCardSkeleton cardTitle="Anime Watched This Year" />
          <HomeCardSkeleton cardTitle="Manga Read This Year" />
          <HomeCardSkeleton cardTitle="Light Novels Read This Year" />
        </div>
      </div>
    </section>
  );
}
