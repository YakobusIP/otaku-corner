import HomeCard from "@/components/general/HomeCard";
import { Button } from "@/components/ui/button";
import { MediaType } from "@/enum/general.enum";
import { Link } from "react-router-dom";

export default function Home() {
  const exploreRoutes = [
    { id: 1, path: "/anime", text: "Explore Anime" },
    { id: 2, path: "/manga", text: "Explore Manga" },
    { id: 3, path: "/lightnovel", text: "Explore Light Novels" }
  ];

  const topMedias = [
    {
      id: 1,
      cardTitle: "Anime Watched This Year",
      amount: 42,
      type: MediaType.ANIME,
      path: "/anime",
      image: "/placeholder.webp",
      mediaTitle: "Gimai Seikatsu",
      rating: 8.5
    },
    {
      id: 2,
      cardTitle: "Manga Read This Year",
      amount: 42,
      type: MediaType.MANGA,
      path: "/manga",
      image: "/placeholder.webp",
      mediaTitle: "Gimai Seikatsu",
      rating: 8.5
    },
    {
      id: 3,
      cardTitle: "Light Novels Read This Year",
      amount: 42,
      type: MediaType.LIGHT_NOVEL,
      path: "/lightnovel",
      image: "/placeholder.webp",
      mediaTitle: "Gimai Seikatsu",
      rating: 8.5
    }
  ];

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-primary text-primary-foreground py-12 md:py-16 lg:py-20">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
            <div className="flex flex-col gap-4">
              <h1 className="max-w-[650px]">
                Track My Anime, Manga, and Light Novels
              </h1>
              <h4 className="text-primary-foreground/80 max-w-[650px]">
                This platform provides reviews and ratings for anime, manga, and
                light novels that I've consumed.
              </h4>
              <div className="flex flex-col lg:flex-row items-center gap-4">
                {exploreRoutes.map((route) => {
                  return (
                    <Link
                      key={route.id}
                      to={route.path}
                      className="w-full lg:w-fit"
                    >
                      <Button variant="secondary" className="w-full lg:w-fit">
                        {route.text}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
            <img
              src="/hero_image.webp"
              alt="Hero Image"
              width={500}
              height={500}
              className="rounded-xl object-cover"
            />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topMedias.map((media) => {
                return <HomeCard key={media.id} {...media} />;
              })}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted py-6 text-muted-foreground">
        <div className="container flex items-center justify-between">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Otaku Corner
          </p>
        </div>
      </footer>
    </div>
  );
}
