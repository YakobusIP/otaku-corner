import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { StructuredLogger } from "@/common/logging/structured-logger.service";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { assertSafeObjectStorageKey } from "./storage-object-key";

type R2PublicRuntime = {
  client: S3Client;
  bucketName: string;
  publicBaseUrl: string;
};

type R2PrivateRuntime = {
  client: S3Client;
  bucketName: string;
};

export const R2_PRIVATE_PRESIGNED_GET_EXPIRES_SECONDS = 3600;

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
  private publicRuntime: R2PublicRuntime | undefined;
  private privateRuntime: R2PrivateRuntime | undefined;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: StructuredLogger
  ) {}

  private createClient(accessKeyId: string, secretAccessKey: string): S3Client {
    const accountId = this.config.getOrThrow<string>("R2_ACCOUNT_ID");
    return new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
  }

  private getPublicRuntime(): R2PublicRuntime {
    if (this.publicRuntime) {
      return this.publicRuntime;
    }
    const accessKeyId = this.config.getOrThrow<string>(
      "R2_PUBLIC_ACCESS_KEY_ID"
    );
    const secretAccessKey = this.config.getOrThrow<string>(
      "R2_PUBLIC_SECRET_ACCESS_KEY"
    );
    const bucketName = this.config.getOrThrow<string>("R2_PUBLIC_BUCKET_NAME");
    const rawPublicBaseUrl = this.config
      .getOrThrow<string>("R2_PUBLIC_BASE_URL")
      .trim();
    new URL(rawPublicBaseUrl);
    const publicBaseUrl = rawPublicBaseUrl.replace(/\/+$/, "");
    const client = this.createClient(accessKeyId, secretAccessKey);
    this.publicRuntime = { client, bucketName, publicBaseUrl };
    return this.publicRuntime;
  }

  private getPrivateRuntime(): R2PrivateRuntime {
    if (this.privateRuntime) {
      return this.privateRuntime;
    }
    const accessKeyId = this.config.getOrThrow<string>(
      "R2_PRIVATE_ACCESS_KEY_ID"
    );
    const secretAccessKey = this.config.getOrThrow<string>(
      "R2_PRIVATE_SECRET_ACCESS_KEY"
    );
    const bucketName = this.config.getOrThrow<string>("R2_PRIVATE_BUCKET_NAME");
    const client = this.createClient(accessKeyId, secretAccessKey);
    this.privateRuntime = { client, bucketName };
    return this.privateRuntime;
  }

  async deleteObject(
    key: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    assertSafeObjectStorageKey(key);
    const { client, bucketName } = this.getPublicRuntime();
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
        event: "storage.r2.public.delete.failed",
        message: "R2 public delete object failed",
        error: errorFromUnknown(error),
        meta: {
          storage_key: key,
          ...(meta ?? {})
        }
      });
      throw error;
    }
  }

  async deletePrivateObject(
    key: string,
    meta?: Record<string, unknown>
  ): Promise<void> {
    assertSafeObjectStorageKey(key);
    const { client, bucketName } = this.getPrivateRuntime();
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
        event: "storage.r2.private.delete.failed",
        message: "R2 private delete object failed",
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
    return this.headObjectInBucket(key, this.getPublicRuntime(), {
      failureEvent: "storage.r2.public.head.failed",
      failureMessage: "R2 public head object failed",
      meta
    });
  }

  async headPrivateObject(
    key: string,
    meta?: Record<string, unknown>
  ): Promise<R2HeadObjectResult | null> {
    return this.headObjectInBucket(key, this.getPrivateRuntime(), {
      failureEvent: "storage.r2.private.head.failed",
      failureMessage: "R2 private head object failed",
      meta
    });
  }

  private async headObjectInBucket(
    key: string,
    runtime: { client: S3Client; bucketName: string },
    log: {
      failureEvent: string;
      failureMessage: string;
      meta?: Record<string, unknown>;
    }
  ): Promise<R2HeadObjectResult | null> {
    assertSafeObjectStorageKey(key);
    try {
      const out = await runtime.client.send(
        new HeadObjectCommand({
          Bucket: runtime.bucketName,
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
        event: log.failureEvent,
        message: log.failureMessage,
        error: errorFromUnknown(error),
        meta: {
          storage_key: key,
          ...(log.meta ?? {})
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
    const { client, bucketName } = this.getPublicRuntime();
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
        event: "storage.r2.public.presign_put.failed",
        message: "R2 public presigned PUT URL generation failed",
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

  async getPrivatePresignedPutUrl(params: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
    meta?: Record<string, unknown>;
  }): Promise<string> {
    assertSafeObjectStorageKey(params.key);
    const { client, bucketName } = this.getPrivateRuntime();
    const cmd = new PutObjectCommand({
      Bucket: bucketName,
      Key: params.key,
      ContentType: params.contentType
    });
    try {
      return await getSignedUrl(client, cmd, {
        expiresIn: params.expiresInSeconds ?? 900
      });
    } catch (error: unknown) {
      this.logger.logStorage({
        level: "error",
        event: "storage.r2.private.presign_put.failed",
        message: "R2 private presigned PUT URL generation failed",
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

  async getPrivatePresignedGetUrl(params: {
    key: string;
    expiresInSeconds?: number;
    responseContentDisposition?: string;
    meta?: Record<string, unknown>;
  }): Promise<string> {
    assertSafeObjectStorageKey(params.key);
    const { client, bucketName } = this.getPrivateRuntime();
    const cmd = new GetObjectCommand({
      Bucket: bucketName,
      Key: params.key,
      ...(params.responseContentDisposition
        ? { ResponseContentDisposition: params.responseContentDisposition }
        : {})
    });
    try {
      return await getSignedUrl(client, cmd, {
        expiresIn:
          params.expiresInSeconds ?? R2_PRIVATE_PRESIGNED_GET_EXPIRES_SECONDS
      });
    } catch (error: unknown) {
      this.logger.logStorage({
        level: "error",
        event: "storage.r2.private.presign_get.failed",
        message: "R2 private presigned GET URL generation failed",
        error: errorFromUnknown(error),
        meta: {
          storage_key: params.key,
          ...(params.meta ?? {})
        }
      });
      throw error;
    }
  }

  publicUrlForFile(key: string): string {
    assertSafeObjectStorageKey(key);
    const { publicBaseUrl } = this.getPublicRuntime();
    const pathSuffix = key
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${publicBaseUrl}/${pathSuffix}`;
  }
}
