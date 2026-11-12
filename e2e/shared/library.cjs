const posterUrl = "https://e2e-r2-public.example.com/e2e-poster.jpg";

const library = {
  anime: {
    id: 921001,
    slug: "e2e-playwright-anime-921001",
    title: "Playwright Anime Movie 921001",
    synopsis: "Playwright anime synopsis 921001."
  },
  manga: {
    id: 931001,
    slug: "e2e-playwright-manga-931001",
    title: "Playwright Manga 931001",
    synopsis: "Playwright manga synopsis 931001."
  },
  lightNovel: {
    id: 941001,
    slug: "e2e-playwright-ln-941001",
    title: "Playwright Light Novel 941001",
    synopsis: "Playwright light novel synopsis 941001."
  }
};

const animePath = `/anime/${library.anime.id}/${library.anime.slug}`;
const mangaPath = `/manga/${library.manga.id}/${library.manga.slug}`;
const lightNovelPath = `/light-novel/${library.lightNovel.id}/${library.lightNovel.slug}`;

module.exports = {
  posterUrl,
  library,
  animePath,
  mangaPath,
  lightNovelPath
};
