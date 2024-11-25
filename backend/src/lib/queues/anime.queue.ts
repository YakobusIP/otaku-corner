import Queue, { Job } from "bull";
import { InternalServerError } from "../error";
import axios from "axios";
import { AnimeService } from "../../services/anime.service";
import { GenreService } from "../../services/genre.service";
import { StudioService } from "../../services/studio.service";
import { ThemeService } from "../../services/theme.service";
import { QueueLogger } from "./queue.logger";
import { v4 as uuidv4 } from "uuid";
import { env } from "../env";

type FetchEpisodesJobData = {
  id: number;
};

type JikanEpisode = {
  mal_id: number;
  url: string;
  title: string;
  title_japanese?: string | null;
  title_romanji?: string | null;
  aired: string;
  score: number;
  filler: boolean;
  recap: boolean;
  forum_url: string;
};

type JikanResponse = {
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
  data: JikanEpisode[];
};

const animeService = new AnimeService(
  new GenreService(),
  new StudioService(),
  new ThemeService()
);

export const fetchEpisodesQueue = new Queue<FetchEpisodesJobData>(
  "fetchEpisodesQueue",
  {
    redis: {
      host: env.BULL_REDIS_IP,
      port: env.BULL_REDIS_PORT,
      maxRetriesPerRequest: null
    },
    limiter: {
      max: 1,
      duration: 1000
    },
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 1000
      }
    }
  }
);

const processFetchEpisodesQueue = async (job: Job<FetchEpisodesJobData>) => {
  const jobId = `fetchEpisodesQueue-${job.id}-${uuidv4()}`;
  await QueueLogger.logJobStart(jobId, "fetchEpisodesQueue", job.data);

  try {
    const response = await axios.get<JikanResponse>(
      `https://api.jikan.moe/v4/anime/${job.data.id}/episodes`
    );

    if (response.status === 200) {
      const episodesData = response.data.data.map((episode) => ({
        aired: episode.aired
          ? new Date(episode.aired).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
          : "N/A",
        number: episode.mal_id,
        title: episode.title,
        titleJapanese: episode.title_japanese,
        titleRomaji: episode.title_romanji,
        animeId: job.data.id
      }));

      await animeService.addAnimeEpisodes(episodesData);
      await QueueLogger.updateJobStatus(jobId, "COMPLETED", episodesData);
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

fetchEpisodesQueue.process(processFetchEpisodesQueue);
