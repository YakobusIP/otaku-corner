import { AnimeClient, MangaClient } from "@tutkli/jikan-ts";

const apiBaseUrl = import.meta.env.VITE_AXIOS_BASE_URL.replace(/\/+$/, "");
const jikanBaseUrl = `${apiBaseUrl}/api/jikan`;

export const animeJikanClient = new AnimeClient({ baseURL: jikanBaseUrl });
export const mangaJikanClient = new MangaClient({ baseURL: jikanBaseUrl });
