import { MessageResponse } from "@/types/api.type";
import { UploadImage } from "@/types/upload.type";

import interceptedAxios, { handleAxiosError } from "@/lib/axios";

const BASE_UPLOAD_URL = "/api/upload";
type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const createUploadService = () => {
  const upload = async (file: File, type: string, reviewId: number) => {
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
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  const remove = async (id: string) => {
    try {
      const response = await interceptedAxios.delete<MessageResponse>(
        `${BASE_UPLOAD_URL}/${id}`
      );
      return response.data;
    } catch (error) {
      const message = handleAxiosError(error);
      throw new Error(message);
    }
  };

  return { upload, remove };
};

const uploadService = createUploadService();

const uploadImageService = async (
  file: File,
  type: string,
  reviewId: number
): Promise<ServiceResult<UploadImage>> => {
  try {
    return { success: true, data: await uploadService.upload(file, type, reviewId) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

const deleteImageService = async (
  id: string
): Promise<ServiceResult<MessageResponse>> => {
  try {
    return { success: true, data: await uploadService.remove(id) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export { uploadService, uploadImageService, deleteImageService };
