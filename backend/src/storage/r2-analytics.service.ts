import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { loggedAxiosRequest } from "@/common/logging/http-client-logging";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

const CLOUDFLARE_GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql";
/** Keep admin useImageVaultR2Analytics staleTime aligned with this TTL. */
const CACHE_TTL_MS = 10 * 60 * 1000;
const OPERATIONS_LOOKBACK_DAYS = 30;
const STORAGE_LOOKBACK_DAYS = 2;

// Class A/B action types: https://developers.cloudflare.com/r2/pricing/
const CLASS_A_ACTION_TYPES = new Set([
  "ListBuckets",
  "PutBucket",
  "ListObjects",
  "PutObject",
  "CopyObject",
  "CompleteMultipartUpload",
  "CreateMultipartUpload",
  "LifecycleStorageTierTransition",
  "ListMultipartUploads",
  "UploadPart",
  "UploadPartCopy",
  "ListParts",
  "PutBucketEncryption",
  "PutBucketCors",
  "PutBucketLifecycleConfiguration"
]);

const CLASS_B_ACTION_TYPES = new Set([
  "HeadBucket",
  "HeadObject",
  "GetObject",
  "UsageSummary",
  "GetBucketEncryption",
  "GetBucketLocation",
  "GetBucketCors",
  "GetBucketLifecycleConfiguration"
]);

const R2_ANALYTICS_QUERY = `
query R2StorageAnalytics(
  $accountTag: string!
  $operationsStart: Time!
  $operationsEnd: Time!
  $storageStart: Time!
  $bucketName: string!
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      operations: r2OperationsAdaptiveGroups(
        limit: 10000
        filter: {
          datetime_geq: $operationsStart
          datetime_leq: $operationsEnd
          bucketName: $bucketName
        }
      ) {
        sum {
          requests
        }
        dimensions {
          actionType
        }
      }
      storage: r2StorageAdaptiveGroups(
        limit: 1
        filter: {
          datetime_geq: $storageStart
          datetime_leq: $operationsEnd
          bucketName: $bucketName
        }
        orderBy: [datetime_DESC]
      ) {
        max {
          objectCount
          payloadSize
        }
        dimensions {
          datetime
        }
      }
    }
  }
}
`;

type R2StorageAnalytics = {
  objectCount: number;
  classAOperations: number;
  classBOperations: number;
  totalPayloadSizeBytes: number;
};

type GraphqlOperationGroup = {
  sum?: { requests?: number | null } | null;
  dimensions?: { actionType?: string | null } | null;
};

type GraphqlStorageGroup = {
  max?: {
    objectCount?: number | null;
    payloadSize?: number | null;
  } | null;
};

type GraphqlAnalyticsResponse = {
  data?: {
    viewer?: {
      accounts?: Array<{
        operations?: GraphqlOperationGroup[] | null;
        storage?: GraphqlStorageGroup[] | null;
      }> | null;
    } | null;
  } | null;
  errors?: Array<{ message?: string }> | null;
};

type CacheEntry = {
  expiresAtMs: number;
  value: R2StorageAnalytics;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const readLatestStorageSnapshot = (
  groups: GraphqlStorageGroup[] | null | undefined
): { objectCount: number; payloadSize: number } => {
  const snapshot = groups?.[0]?.max;
  const objectCount = snapshot?.objectCount;
  const payloadSize = snapshot?.payloadSize;
  return {
    objectCount: isFiniteNumber(objectCount) ? objectCount : 0,
    payloadSize: isFiniteNumber(payloadSize) ? payloadSize : 0
  };
};

@Injectable()
export class R2AnalyticsService {
  private cache: CacheEntry | undefined;
  private inFlight: Promise<R2StorageAnalytics> | undefined;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: StructuredLogger
  ) {}

  async getStorageAnalytics(): Promise<R2StorageAnalytics> {
    const nowMs = Date.now();
    if (this.cache && this.cache.expiresAtMs > nowMs) {
      return this.cache.value;
    }

    if (this.inFlight) {
      return this.inFlight;
    }

    this.inFlight = this.fetchStorageAnalytics()
      .then((value) => {
        this.cache = {
          expiresAtMs: Date.now() + CACHE_TTL_MS,
          value
        };
        return value;
      })
      .finally(() => {
        this.inFlight = undefined;
      });

    return this.inFlight;
  }

  private async fetchStorageAnalytics(): Promise<R2StorageAnalytics> {
    const apiToken = this.config.get<string | undefined>(
      "CLOUDFLARE_API_TOKEN"
    );
    if (!apiToken) {
      throw new ServiceUnavailableException(
        "R2 analytics requires CLOUDFLARE_API_TOKEN with Account Analytics Read permission."
      );
    }

    const accountTag = this.config.getOrThrow<string>("R2_ACCOUNT_ID");
    const bucketName = this.config.getOrThrow<string>("R2_PRIVATE_BUCKET_NAME");

    const operationsEnd = new Date();
    const operationsStart = new Date(operationsEnd);
    operationsStart.setUTCDate(
      operationsStart.getUTCDate() - OPERATIONS_LOOKBACK_DAYS
    );
    const storageStart = new Date(operationsEnd);
    storageStart.setUTCDate(storageStart.getUTCDate() - STORAGE_LOOKBACK_DAYS);

    const response = await loggedAxiosRequest<GraphqlAnalyticsResponse>(
      this.logger,
      {
        provider: "cloudflare",
        method: "POST",
        endpoint: "/client/v4/graphql"
      },
      {
        method: "POST",
        url: CLOUDFLARE_GRAPHQL_URL,
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        },
        timeout: 15_000,
        data: {
          query: R2_ANALYTICS_QUERY,
          variables: {
            accountTag,
            operationsStart: operationsStart.toISOString(),
            operationsEnd: operationsEnd.toISOString(),
            storageStart: storageStart.toISOString(),
            bucketName
          }
        }
      }
    );

    const body = response.data;
    if (body.errors?.length) {
      const message =
        body.errors
          .map((error) => error.message)
          .filter((part): part is string => Boolean(part))
          .join("; ") || "Cloudflare GraphQL analytics query failed";
      throw new ServiceUnavailableException(message);
    }

    const account = body.data?.viewer?.accounts?.[0];
    if (!account) {
      throw new ServiceUnavailableException(
        "Cloudflare GraphQL analytics returned no account data"
      );
    }

    let classAOperations = 0;
    let classBOperations = 0;
    for (const group of account.operations ?? []) {
      const actionType = group.dimensions?.actionType?.trim() ?? "";
      const requests = group.sum?.requests;
      if (!actionType || !isFiniteNumber(requests) || requests <= 0) {
        continue;
      }
      if (CLASS_A_ACTION_TYPES.has(actionType)) {
        classAOperations += requests;
      } else if (CLASS_B_ACTION_TYPES.has(actionType)) {
        classBOperations += requests;
      }
    }

    const storage = readLatestStorageSnapshot(account.storage);

    return {
      objectCount: storage.objectCount,
      classAOperations,
      classBOperations,
      totalPayloadSizeBytes: storage.payloadSize
    };
  }
}
