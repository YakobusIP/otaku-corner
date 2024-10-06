import { Request, Response } from "express";
import { UploadService } from "../services/upload.service";
import { MEDIA_TYPE } from "../enum/general.enum";

export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  uploadImage = async (req: Request, res: Response) => {
    try {
      const { type, entityId } = req.body;

      if (!Object.values(MEDIA_TYPE).includes(type)) {
        return res.status(400).json({ error: "Invalid type specified!" });
      }

      if (!entityId || isNaN(Number(entityId))) {
        return res.status(400).json({ error: "Valid entityId is required!" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded!" });
      }

      const { id, url } = await this.uploadService.uploadImage(
        req.file,
        type,
        Number(entityId)
      );

      return res.status(200).json({ data: { id, url } });
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  deleteImage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Image URL required!" });
      }

      await this.uploadService.deleteImage(parseInt(id));

      return res.status(200).json({ message: "Image deleted successfully!" });
    } catch (error) {
      return res.status(500).json({ error });
    }
  };
}
