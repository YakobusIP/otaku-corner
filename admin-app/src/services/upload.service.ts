import { MessageResponse } from "@/types/api.type";
import { UploadImage } from "@/types/upload.type";
import type { ServiceResult } from "@/types/general.type";

import interceptedAxios from "@/lib/axios";
import { ok, err } from "@/lib/service-result";

const BASE_UPLOAD_URL = "/api/upload";

const createUploadService = () => {
  const upload = async (
    file: File,
    type: string,
    reviewId: number
  ): Promise<ServiceResult<UploadImage>> => {
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("type", type);
      form.append("reviewId", reviewId.toString());

      const response = await interceptedAxios.post<UploadImage>(
        BASE_UPLOAD_URL,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      return ok(response.data);
    } catch (error) {
      return err(error);
    }
  };

  const remove = async (id: string): Promise<ServiceResult<MessageResponse>> => {
    try {
      const response = await interceptedAxios.delete<MessageResponse>(
        `${BASE_UPLOAD_URL}/${id}`
      );
      return ok({ message: response.data.message ?? "" });
    } catch (error) {
      return err(error);
    }
  };

  return { upload, remove };
};

export const uploadService = createUploadService();
