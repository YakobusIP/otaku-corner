import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, join, resolve as resolvePath } from "node:path";

import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FileStorageService implements OnModuleInit {
  private readonly absoluteRoot: string;

  static resolveAbsoluteRootDir(config: ConfigService): string {
    return resolvePath(config.getOrThrow<string>("UPLOADS_DIR"));
  }

  private static assertSafeStorageFilename(name: string): void {
    if (!name || name !== basename(name) || name.includes("..")) {
      throw new BadRequestException("Invalid storage filename");
    }
  }

  constructor(private readonly config: ConfigService) {
    this.absoluteRoot = FileStorageService.resolveAbsoluteRootDir(config);
  }

  onModuleInit(): void {
    if (!existsSync(this.absoluteRoot)) {
      mkdirSync(this.absoluteRoot, { recursive: true });
    }
  }

  getAbsoluteRoot(): string {
    return this.absoluteRoot;
  }

  writeFile(filename: string, data: Buffer): void {
    FileStorageService.assertSafeStorageFilename(filename);
    const filePath = join(this.absoluteRoot, filename);
    writeFileSync(filePath, data);
  }

  deleteFileIfExists(filename: string): void {
    FileStorageService.assertSafeStorageFilename(filename);
    const filePath = join(this.absoluteRoot, filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  publicUrlForFile(filename: string): string {
    FileStorageService.assertSafeStorageFilename(filename);
    const base = this.config.get<string>("PUBLIC_UPLOADS_BASE_URL") ?? "";
    const port = this.config.get<number>("PORT");
    const prefix =
      base.length > 0
        ? base.replace(/\/+$/, "")
        : `http://127.0.0.1:${port}/uploads`;
    return `${prefix}/${filename}`;
  }
}
