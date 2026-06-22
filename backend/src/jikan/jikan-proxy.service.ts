import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { loggedAxiosRequest } from "@/common/logging/http-client-logging";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

const ALLOWED_JIKAN_PATH = /^\/(anime|manga)(\/|$)/;

type JikanProxyLogContext = {
  correlation_id?: string;
  request_id?: string | null;
  endpoint?: string;
  queue_name?: string;
  job_id?: string | null;
  job_name?: string;
};

@Injectable()
export class JikanProxyService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: StructuredLogger
  ) {}

  async forwardGet(
    path: string,
    query: Record<string, unknown> = {},
    logContext: JikanProxyLogContext = {}
  ): Promise<unknown> {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    if (!ALLOWED_JIKAN_PATH.test(normalizedPath)) {
      throw new BadRequestException("Invalid Jikan proxy path");
    }

    const baseUrl = this.config.getOrThrow<string>("JIKAN_BASE_URL");
    const response = await loggedAxiosRequest<unknown>(
      this.logger,
      {
        provider: "jikan",
        method: "GET",
        endpoint: logContext.endpoint ?? `jikan.proxy${normalizedPath}`,
        correlation_id: logContext.correlation_id,
        request_id: logContext.request_id,
        queue_name: logContext.queue_name,
        job_id: logContext.job_id,
        job_name: logContext.job_name
      },
      {
        method: "GET",
        url: `${baseUrl}${normalizedPath}`,
        params: query
      }
    );

    return response.data;
  }
}
