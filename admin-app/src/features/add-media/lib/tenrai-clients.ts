import { AnimeClient, MangaClient } from "@tutkli/jikan-ts";

const apiBaseUrl = import.meta.env.VITE_AXIOS_BASE_URL.replace(/\/+$/, "");
const tenraiBaseUrl = `${apiBaseUrl}/api/tenrai`;

export const animeTenraiClient = new AnimeClient({ baseURL: tenraiBaseUrl });
export const mangaTenraiClient = new MangaClient({ baseURL: tenraiBaseUrl });
