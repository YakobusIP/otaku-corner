const { apiBaseUrl } = require("./env.cjs");
const { library, posterUrl } = require("./library.cjs");

const images = { image_url: posterUrl };

const readAccessToken = (body) => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error("Login response was not an object");
  }
  const accessToken = body.accessToken;
  if (typeof accessToken !== "string" || accessToken.length === 0) {
    throw new Error("Login response did not include an access token");
  }
  return accessToken;
};

const requestJson = async (url, options) => {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `${options.method ?? "GET"} ${url} -> ${response.status} ${text}`
    );
  }
  if (!text) {
    return undefined;
  }
  return JSON.parse(text);
};

const seedLibrary = async (baseApiUrl = apiBaseUrl) => {
  const loginBody = await requestJson(`${baseApiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pin1: "135790", pin2: "246801" })
  });
  const accessToken = readAccessToken(loginBody);
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${accessToken}`
  };

  await requestJson(`${baseApiUrl}/api/animes/bulk`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: [
        {
          id: library.anime.id,
          slug: library.anime.slug,
          type: "Movie",
          status: "Finished Airing",
          rating: "PG-13",
          title: library.anime.title,
          titleJapanese: "Playwright Anime JP",
          titleSynonyms: "Playwright Anime",
          source: "Original",
          aired: "Jan 1, 2020 to Jan 1, 2020",
          broadcast: "",
          duration: "90 min",
          score: 7.5,
          images,
          synopsis: library.anime.synopsis,
          malUrl: `https://myanimelist.net/anime/${library.anime.id}`,
          genres: ["Playwright Genre"],
          studios: ["Playwright Studio"],
          themes: ["Playwright Theme"]
        }
      ]
    })
  });

  await requestJson(`${baseApiUrl}/api/mangas/bulk`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: [
        {
          id: library.manga.id,
          slug: library.manga.slug,
          status: "Finished",
          title: library.manga.title,
          titleJapanese: "Playwright Manga JP",
          titleSynonyms: "Playwright Manga",
          published: "Jan 1, 2020 to Jan 1, 2021",
          chaptersCount: 24,
          volumesCount: 3,
          score: 7.8,
          images,
          synopsis: library.manga.synopsis,
          malUrl: `https://myanimelist.net/manga/${library.manga.id}`,
          authors: ["Playwright Author"],
          genres: ["Playwright Genre"],
          themes: ["Playwright Theme"]
        }
      ]
    })
  });

  await requestJson(`${baseApiUrl}/api/light-novels/bulk`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: [
        {
          id: library.lightNovel.id,
          slug: library.lightNovel.slug,
          status: "Finished",
          title: library.lightNovel.title,
          titleJapanese: "Playwright Light Novel JP",
          titleSynonyms: "Playwright LN",
          published: "Jan 1, 2020 to Jan 1, 2021",
          volumesCount: 4,
          score: 7.2,
          images,
          synopsis: library.lightNovel.synopsis,
          malUrl: `https://myanimelist.net/manga/${library.lightNovel.id}`,
          authors: ["Playwright Author"],
          genres: ["Playwright Genre"],
          themes: ["Playwright Theme"]
        }
      ]
    })
  });

  for (const idPath of [
    `animes/${library.anime.id}`,
    `mangas/${library.manga.id}`,
    `light-novels/${library.lightNovel.id}`
  ]) {
    await requestJson(`${baseApiUrl}/api/${idPath}/review`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ progressStatus: "COMPLETED" })
    });
  }
};

module.exports = { seedLibrary };
