import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";

import type {
  FileStorage,
  FileStorageWriteOptions
} from "./file-storage.interface";
import { assertSafeObjectStorageKey } from "./storage-object-key";

type R2Runtime = {
  client: S3Client;
  bucketName: string;
  publicBaseUrl: string;
};

@Injectable()
export class R2FileStorageService implements FileStorage {
  private runtime: R2Runtime | undefined;

  constructor(private readonly config: ConfigService) {}

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

  async writeFileAsync(
    key: string,
    data: Buffer,
    options?: FileStorageWriteOptions
  ): Promise<void> {
    assertSafeObjectStorageKey(key);
    const { client, bucketName } = this.getRuntime();
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: data,
        ...(options?.contentType ? { ContentType: options.contentType } : {}),
        ...(options?.cacheControl ? { CacheControl: options.cacheControl } : {})
      })
    );
  }

  async deleteFileIfExists(key: string): Promise<void> {
    assertSafeObjectStorageKey(key);
    const { client, bucketName } = this.getRuntime();
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      })
    );
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
