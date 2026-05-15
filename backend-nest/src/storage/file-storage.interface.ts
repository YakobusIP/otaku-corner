export const FILE_STORAGE = Symbol("FILE_STORAGE");

export type FileStorageWriteOptions = {
  contentType?: string;
  cacheControl?: string;
};

export type FileStorage = {
  writeFileAsync(
    key: string,
    data: Buffer,
    options?: FileStorageWriteOptions
  ): Promise<void>;
  deleteFileIfExists(key: string): Promise<void>;
  publicUrlForFile(key: string): string;
};
