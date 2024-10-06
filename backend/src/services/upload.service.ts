import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { generateFilename } from "../utils/generateFilename";
import { bucket } from "../lib/storage";
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { env } from "../lib/env";
import path from "path";
import { MEDIA_TYPE } from "../enum/general.enum";

export class UploadService {
  private async saveImageToDatabase(
    uuid: string,
    url: string,
    type: MEDIA_TYPE,
    entityId: string
  ) {
    const data: Prisma.ReviewImageCreateInput = { id: uuid, url };

    switch (type) {
      case MEDIA_TYPE.ANIME:
        data.anime = { connect: { id: entityId } };
        break;
      case MEDIA_TYPE.MANGA:
        data.manga = { connect: { id: entityId } };
        break;
      case MEDIA_TYPE.LIGHT_NOVEL:
        data.lightNovel = { connect: { id: entityId } };
        break;
      default:
        break;
    }

    return await prisma.reviewImage.create({ data });
  }

  async uploadImage(
    file: Express.Multer.File,
    type: MEDIA_TYPE,
    entityId: string
  ) {
    try {
      const [uuid, filename] = generateFilename(file.originalname);
      const filePath = `review-image/${filename}`;

      if (env.NODE_ENV === "production") {
        const blob = bucket.file(filePath);
        const blobStream = blob.createWriteStream({
          resumable: false,
          contentType: file.mimetype,
          public: true
        });

        await new Promise<void>((resolve, reject) => {
          blobStream.on("error", () =>
            reject(new Error("Failed to upload image to storage"))
          );
          blobStream.on("finish", () => resolve());
          blobStream.end(file.buffer);
        });
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        return await this.saveImageToDatabase(uuid, publicUrl, type, entityId);
      } else {
        const localPath = path.join(__dirname, env.LOCAL_UPLOAD_PATH, filename);
        writeFileSync(localPath, file.buffer);

        const url = `http://localhost:${env.PORT}/uploads/${filename}`;
        return await this.saveImageToDatabase(uuid, url, type, entityId);
      }
    } catch (error) {
      console.error("Upload image error:", error);
      throw new Error("Failed to upload image and save the record");
    }
  }

  async deleteImage(id: string) {
    try {
      const reviewImage = await prisma.reviewImage.findUnique({
        where: { id }
      });

      if (!reviewImage) {
        throw new Error("Image not found!");
      }

      const urlParts = reviewImage.url.split("/");
      const filename = urlParts[urlParts.length - 1];

      if (env.NODE_ENV === "production") {
        const file = bucket.file(filename);
        try {
          await file.delete();
        } catch (error) {
          console.warn("Google Cloud Storage deletion error:", error);
        }
      } else {
        const localPath = path.join(__dirname, env.LOCAL_UPLOAD_PATH, filename);
        try {
          if (existsSync(localPath)) {
            unlinkSync(localPath);
          } else {
            console.warn("Local image file not found");
          }
        } catch (error) {
          console.warn("Local image deletion error:", error);
        }
      }

      await prisma.reviewImage.delete({ where: { id } });
    } catch (error) {
      console.error("Deletion image error:", error);
      throw new Error("Failed to delete image");
    }
  }
}
