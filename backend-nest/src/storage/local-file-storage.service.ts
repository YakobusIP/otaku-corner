import { existsSync, mkdirSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve as resolvePath } from "node:path";

import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type {
  FileStorage,
  FileStorageWriteOptions
} from "./file-storage.interface";
import { assertSafeObjectStorageKey } from "./storage-object-key";

@Injectable()
export class LocalFileStorageService implements OnModuleInit, FileStorage {
  private readonly absoluteRoot: string;

  static resolveAbsoluteRootDir(config: ConfigService): string {
    return resolvePath(config.getOrThrow<string>("UPLOADS_DIR"));
  }

  constructor(private readonly config: ConfigService) {
    this.absoluteRoot = LocalFileStorageService.resolveAbsoluteRootDir(config);
  }

  onModuleInit(): void {
    if (!existsSync(this.absoluteRoot)) {
      mkdirSync(this.absoluteRoot, { recursive: true });
    }
  }

  async writeFileAsync(
    key: string,
    data: Buffer,
    _options?: FileStorageWriteOptions
  ): Promise<void> {
    assertSafeObjectStorageKey(key);
    const filePath = join(this.absoluteRoot, key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
  }

  async deleteFileIfExists(key: string): Promise<void> {
    assertSafeObjectStorageKey(key);
    const filePath = join(this.absoluteRoot, key);
    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  publicUrlForFile(key: string): string {
    assertSafeObjectStorageKey(key);
    const base = this.config.get<string>("PUBLIC_UPLOADS_BASE_URL") ?? "";
    const port = this.config.get<number>("PORT");
    const prefix =
      base.length > 0
        ? base.replace(/\/+$/, "")
        : `http://127.0.0.1:${port}/uploads`;
    const pathSuffix = key
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${prefix}/${pathSuffix}`;
  }

  getAbsoluteRoot(): string {
    return this.absoluteRoot;
  }
}
