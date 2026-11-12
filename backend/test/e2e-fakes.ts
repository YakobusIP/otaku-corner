import type { R2HeadObjectResult } from "@/storage/r2-file-storage.service";

export const tenraiForwardGet = jest.fn(async () => ({}));

type StoredObject = {
  contentType: string;
  contentLength: number;
};

const objects = new Map<string, StoredObject>();

export const fakeR2 = {
  remember(key: string, object: StoredObject): void {
    objects.set(key, object);
  },

  reset(): void {
    objects.clear();
  },

  publicUrlForFile(key: string): string {
    return `https://e2e-r2-public.example.com/${key}`;
  },

  async getPresignedPutUrl(params: {
    key: string;
    contentType: string;
  }): Promise<string> {
    objects.set(params.key, {
      contentType: params.contentType,
      contentLength: objects.get(params.key)?.contentLength ?? 0
    });
    return `https://e2e-r2-public.example.com/upload/${params.key}`;
  },

  async getPrivatePresignedPutUrl(params: {
    key: string;
    contentType: string;
  }): Promise<string> {
    objects.set(params.key, {
      contentType: params.contentType,
      contentLength: objects.get(params.key)?.contentLength ?? 0
    });
    return `https://e2e-r2-private.example.com/upload/${params.key}`;
  },

  async getPrivatePresignedGetUrl(params: { key: string }): Promise<string> {
    return `https://e2e-r2-private.example.com/download/${params.key}`;
  },

  async headObject(key: string): Promise<R2HeadObjectResult | null> {
    return head(key);
  },

  async headPrivateObject(key: string): Promise<R2HeadObjectResult | null> {
    return head(key);
  },

  async deleteObject(): Promise<void> {},

  async deletePrivateObject(): Promise<void> {}
};

const head = (key: string): R2HeadObjectResult | null => {
  const object = objects.get(key);
  if (!object) {
    return null;
  }
  return {
    contentLength: object.contentLength,
    contentType: object.contentType
  };
};

export const rememberUploadedObject = (
  key: string,
  contentType: string,
  contentLength: number
): void => {
  objects.set(key, { contentType, contentLength });
};
