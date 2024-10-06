import { Storage } from "@google-cloud/storage";
import path from "path";
import { env } from "./env";

interface GlobalForStorage {
  storage: Storage;
  bucket: ReturnType<Storage["bucket"]>;
}

const globalForStorage = globalThis as unknown as GlobalForStorage;

export const storage =
  globalForStorage.storage ||
  new Storage({
    keyFilename: path.join(__dirname, `../${env.GCP_PROJECT_ID}`),
    projectId: ""
  });

export const bucket =
  globalForStorage.bucket || storage.bucket(env.GCS_BUCKET_NAME);

if (env.NODE_ENV !== "production") {
  globalForStorage.storage = storage;
  globalForStorage.bucket = bucket;
}
