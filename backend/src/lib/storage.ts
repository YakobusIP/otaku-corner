import { Storage } from "@google-cloud/storage";
import path from "path";
import { env } from "./env";

type GlobalForStorage = {
  storage: Storage;
  bucket: ReturnType<Storage["bucket"]>;
};

const globalForStorage = globalThis as unknown as GlobalForStorage;

export const storage =
  globalForStorage.storage || env.NODE_ENV === "production"
    ? new Storage()
    : new Storage({
        projectId: env.GCP_PROJECT_ID,
        keyFilename: path.join(
          __dirname,
          `../../${env.GOOGLE_APPLICATION_CREDENTIALS}`
        )
      });

export const bucket =
  globalForStorage.bucket || storage.bucket(env.GCS_BUCKET_NAME);

if (env.NODE_ENV !== "production") {
  globalForStorage.storage = storage;
  globalForStorage.bucket = bucket;
}
