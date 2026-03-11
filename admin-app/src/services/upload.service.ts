import { ApiResponse, MessageResponse } from "@/types/api.type";
import { UploadImage } from "@/types/upload.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";

const BASE_UPLOAD_URL = "/api/upload";

const createUploadService = () => {
  const upload = async (file: File, type: string, reviewId: number) => {
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("type", type);
      form.append("reviewId", reviewId.toString());

      const response = await interceptedAxios.post<ApiResponse<UploadImage>>(
        BASE_UPLOAD_URL,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      return response.data.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const remove = async (id: string) => {
    try {
      const response = await interceptedAxios.delete<
        ApiResponse<MessageResponse>
      >(`${BASE_UPLOAD_URL}/${id}`);
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  return { upload, remove };
};

const uploadService = createUploadService();

export { uploadService };
