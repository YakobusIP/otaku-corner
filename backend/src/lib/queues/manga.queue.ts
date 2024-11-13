import Queue, { Job } from "bull";
import { InternalServerError } from "../error";
import axios from "axios";
import { GenreService } from "../../services/genre.service";
import { ThemeService } from "../../services/theme.service";
import { QueueLogger } from "./queue.logger";
import { MangaService } from "../../services/manga.service";
import { AuthorService } from "../../services/author.service";
import { v4 as uuidv4 } from "uuid";
import { stringSimilarity } from "string-similarity-js";
import { env } from "../env";

const BASE_MANGADEX_URL = "https://api.mangadex.org";
const SIMILARITY_THRESHOLD = 0.9;

type FetchMangaDataJobData = {
  manga_id: string;
  title: string;
  titleJapanese: string;
};

type FetchMangaStatisticsData = {
  manga_id: string;
  mangadex_id: string;
};

type AltTitle = {
  [key: string]: string;
};

type MangaDexData = {
  id: string;
  attributes: {
    title: { [key: string]: string };
    altTitles: AltTitle[];
    lastVolume: string;
    lastChapter: string;
    status: string;
  };
};

type MangaDexResponse = {
  result: string;
  data: MangaDexData[];
};

type MangaDexStatisticsResponse = {
  result: string;
  volumes: {
    [volumeKey: string]: {
      volume: string;
      count: number;
      chapters: {
        [chapterKey: string]: {
          chapter: string;
          id: string;
        };
      };
    };
  };
};

const mangaService = new MangaService(
  new AuthorService(),
  new GenreService(),
  new ThemeService()
);

export const fetchMangaDataQueue = new Queue<FetchMangaDataJobData>(
  "fetchMangaDataQueue",
  {
    redis: {
      host: env.BULL_REDIS_IP,
      port: env.BULL_REDIS_PORT
    },
    limiter: {
      max: 1,
      duration: 2000
    }
  }
);

const fetchMangaStatisticsQueue = new Queue<FetchMangaStatisticsData>(
  "fetchMangaStatisticsQueue",
  {
    limiter: {
      max: 1,
      duration: 2000
    }
  }
);

const handleMangaCompleted = async (id: string, manga: MangaDexData) => {
  const { lastVolume, lastChapter, status } = manga.attributes;

  if (status === "completed") {
    const volumesCount = parseFloat(lastVolume);
    const chaptersCount = parseFloat(lastChapter);

    if (!isNaN(volumesCount) && !isNaN(chaptersCount)) {
      await mangaService.updateManga(id, {
        volumesCount: Math.floor(volumesCount),
        chaptersCount: Math.floor(chaptersCount)
      });

      return true;
    }
  }

  return false;
};

const processMangaData = async (id: string, manga: MangaDexData) => {
  if (!(await handleMangaCompleted(id, manga))) {
    await fetchMangaStatisticsQueue.add({
      manga_id: id,
      mangadex_id: manga.id
    });
  }
};

const processFetchMangaDataQueue = async (job: Job<FetchMangaDataJobData>) => {
  const jobId = `fetchMangaDataQueue-${job.id}-${uuidv4()}`;
  await QueueLogger.logJobStart(jobId, "fetchMangaDataQueue", job.data);

  const query =
    job.data.titleJapanese.length > 0 ? job.data.titleJapanese : job.data.title;

  try {
    const response = await axios.get<MangaDexResponse>(
      `${BASE_MANGADEX_URL}/manga?title=${query}`
    );

    if (response.status === 200 && response.data.result === "ok") {
      await QueueLogger.updateJobStatus(jobId, "COMPLETED", response.data);

      // Locate manga with > 90% similarity on english and japanese title if length is > 1
      if (response.data.data.length > 1) {
        let foundHighSimilarity = false;

        for (const manga of response.data.data) {
          const attributes = manga.attributes;
          let similarity = 0;

          // Check if japanese title matches or has a high similarity
          if (job.data.titleJapanese.length > 0) {
            for (const alt of attributes.altTitles) {
              if ("ja" in alt) {
                if (job.data.titleJapanese === alt["ja"]) {
                  foundHighSimilarity = true;
                  await processMangaData(job.data.manga_id, manga);
                  break;
                }

                similarity = stringSimilarity(
                  job.data.titleJapanese,
                  alt["ja"]
                );
                if (similarity > SIMILARITY_THRESHOLD) {
                  foundHighSimilarity = true;
                  await processMangaData(job.data.manga_id, manga);
                  break;
                }
              }
            }
            if (foundHighSimilarity) break;
            // If not, use english title
          } else if ("en" in attributes.title) {
            similarity = stringSimilarity(
              job.data.title,
              attributes.title["en"]
            );

            if (similarity > SIMILARITY_THRESHOLD) {
              foundHighSimilarity = true;
              await processMangaData(job.data.manga_id, manga);
              break;
            }
          }
        }

        // If still unable to find any match, fallback to the 1st item of the array
        if (!foundHighSimilarity) {
          const manga = response.data.data[0];
          await processMangaData(job.data.manga_id, manga);
        }
      } else {
        const manga = response.data.data[0];
        await processMangaData(job.data.manga_id, manga);
      }
    }
  } catch (error) {
    await QueueLogger.updateJobStatus(
      jobId,
      "FAILED",
      (error as Error).message
    );
    throw new InternalServerError((error as Error).message);
  }
};

const processFetchMangaStatisticsQueue = async (
  job: Job<FetchMangaStatisticsData>
) => {
  const jobId = `fetchMangaStatisticsQueue-${job.id}-${uuidv4()}`;
  await QueueLogger.logJobStart(jobId, "fetchMangaStatisticsQueue", job.data);

  try {
    const response = await axios.get<MangaDexStatisticsResponse>(
      `${BASE_MANGADEX_URL}/manga/${job.data.mangadex_id}/aggregate`
    );

    if (response.status === 200 && response.data.result === "ok") {
      const volumes = response.data.volumes;

      const volumeNumbers = Object.keys(volumes)
        .filter((key) => key !== "none")
        .map((key) => parseInt(key, 10))
        .filter((num) => !isNaN(num));

      const maxVolumeNumber =
        volumeNumbers.length > 0 ? Math.max(...volumeNumbers) : 0;

      const volumesCount = maxVolumeNumber + 1;

      const lastVolume = volumes["none"];
      let chaptersCount = 0;

      if (lastVolume && lastVolume.chapters) {
        const chapterNumbers = Object.keys(lastVolume.chapters)
          .map((key) => parseFloat(key))
          .filter((num) => !isNaN(num));

        chaptersCount =
          chapterNumbers.length > 0 ? Math.max(...chapterNumbers) : 0;

        chaptersCount = Math.floor(chaptersCount);
      }

      await mangaService.updateManga(job.data.manga_id, {
        volumesCount,
        chaptersCount
      });

      await QueueLogger.updateJobStatus(jobId, "COMPLETED", response.data);
    }
  } catch (error) {
    await QueueLogger.updateJobStatus(
      jobId,
      "FAILED",
      (error as Error).message
    );
    throw new InternalServerError((error as Error).message);
  }
};

fetchMangaDataQueue.process(processFetchMangaDataQueue);
fetchMangaStatisticsQueue.process(processFetchMangaStatisticsQueue);
