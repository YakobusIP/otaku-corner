import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { StructuredLogger } from "@/common/logging/structured-logger.service";

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { assertSafeObjectStorageKey } from "./storage-object-key";

type R2Runtime = {
  client: S3Client;
  bucketName: string;
  publicBaseUrl: string;
};

export type R2HeadObjectResult = {
  contentLength: number;
  contentType?: string;
};

export const R2_ASSET_CACHE_CONTROL = "public, max-age=31536000, immutable";

const errorFromUnknown = (error: unknown) =>
  error instanceof Error
    ? {
        name: error.name,
        message: error.message,
        stack: error.stack ?? ""
      }
    : {
        name: "Error",
        message: String(error),
        stack: ""
      };

@Injectable()
export class R2FileStorageService {
  private runtime: R2Runtime | undefined;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: StructuredLogger
  ) {}

  private getRuntime(): R2Runtime {
    if (this.runtime) {
      return this.runtime;
    }
    const accountId = this.config.getOrThrow<string>("R2_ACCOUNT_ID");
    const accessKeyId = this.config.getOrThrow<string>("R2_ACCESS_KEY_ID");
    const secretAccessKey = this.config.getOrThrow<string>(
      "R2_SECRET_ACCESS_KEY"
    );
    const bucketName = this.config.getOrThrow<string>("R2_BUCKET_NAME");
    const rawPublicBaseUrl = this.config
      .getOrThrow<string>("R2_PUBLIC_BASE_URL")
      .trim();
    new URL(rawPublicBaseUrl);
    const publicBaseUrl = rawPublicBaseUrl.replace(/\/+$/, "");
    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    this.runtime = { client, bucketName, publicBaseUrl };
    return this.runtime;
  }

  async deleteObject(
    key: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    assertSafeObjectStorageKey(key);
    const { client, bucketName } = this.getRuntime();
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key
        })
      );
    } catch (error: unknown) {
      this.logger.logStorage({
        level: "error",
        event: "storage.r2.delete.failed",
        message: "R2 delete object failed",
        error: errorFromUnknown(error),
        meta: {
          storage_key: key,
          ...(meta ?? {})
        }
      });
      throw error;
    }
  }

  async headObject(
    key: string,
    meta?: Record<string, unknown>
  ): Promise<R2HeadObjectResult | null> {
    assertSafeObjectStorageKey(key);
    const { client, bucketName } = this.getRuntime();
    try {
      const out = await client.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: key
        })
      );
      const len = out.ContentLength;
      if (typeof len !== "number" || !Number.isFinite(len)) {
        return null;
      }
      return {
        contentLength: len,
        contentType: out.ContentType?.trim() || undefined
      };
    } catch (error: unknown) {
      const httpStatus =
        error &&
        typeof error === "object" &&
        "$metadata" in error &&
        error.$metadata &&
        typeof error.$metadata === "object" &&
        "httpStatusCode" in error.$metadata
          ? (error.$metadata as { httpStatusCode?: number }).httpStatusCode
          : undefined;
      const name =
        error && typeof error === "object" && "name" in error
          ? String((error as { name?: string }).name)
          : "";
      if (httpStatus === 404 || name === "NotFound") {
        return null;
      }
      this.logger.logStorage({
        level: "error",
        event: "storage.r2.head.failed",
        message: "R2 head object failed",
        error: errorFromUnknown(error),
        meta: {
          storage_key: key,
          ...(meta ?? {})
        }
      });
      throw error;
    }
  }

  async getPresignedPutUrl(params: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
    meta?: Record<string, unknown>;
  }): Promise<string> {
    assertSafeObjectStorageKey(params.key);
    const { client, bucketName } = this.getRuntime();
    const cmd = new PutObjectCommand({
      Bucket: bucketName,
      Key: params.key,
      ContentType: params.contentType,
      CacheControl: R2_ASSET_CACHE_CONTROL
    });
    try {
      return await getSignedUrl(client, cmd, {
        expiresIn: params.expiresInSeconds ?? 900
      });
    } catch (error: unknown) {
      this.logger.logStorage({
        level: "error",
        event: "storage.r2.presign.failed",
        message: "R2 presigned URL generation failed",
        error: errorFromUnknown(error),
        meta: {
          storage_key: params.key,
          mime_type: params.contentType,
          ...(params.meta ?? {})
        }
      });
      throw error;
    }
  }

  publicUrlForFile(key: string): string {
    assertSafeObjectStorageKey(key);
    const { publicBaseUrl } = this.getRuntime();
    const pathSuffix = key
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${publicBaseUrl}/${pathSuffix}`;
  }
}
