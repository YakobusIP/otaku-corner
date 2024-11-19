import { Request, Response, NextFunction } from "express";
import { UploadService } from "../services/upload.service";
import { MEDIA_TYPE } from "../enum/general.enum";
import { BadRequestError } from "../lib/error";

export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, reviewId } = req.body;

      if (!Object.values(MEDIA_TYPE).includes(type)) {
        throw new BadRequestError("Invalid type specified!");
      }

      if (!req.file) {
        throw new BadRequestError("No file uploaded!");
      }

      const { id, url } = await this.uploadService.uploadImage(
        req.file,
        type,
        reviewId
      );

      return res.status(200).json({ data: { id, url } });
    } catch (error) {
      return next(error);
    }
  };

  deleteImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Image URL required!");
      }

      await this.uploadService.deleteImage(id);

      return res.status(200).json({ message: "Image deleted successfully!" });
    } catch (error) {
      return next(error);
    }
  };
}
