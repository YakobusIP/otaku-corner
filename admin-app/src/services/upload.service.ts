import { ApiResponse, MessageResponse } from "@/types/api.type";
import { UploadImage } from "@/types/upload.type";

import interceptedAxios from "@/lib/axios";

import { AxiosError } from "axios";

const BASE_UPLOAD_URL = "/api/upload";

const uploadImageService = async (
  file: File,
  type: string,
  reviewId: number
): Promise<ApiResponse<UploadImage>> => {
  try {
    const form = new FormData();
    form.append("image", file);
    form.append("type", type);
    form.append("reviewId", reviewId.toString());

    const response = await interceptedAxios.post(BASE_UPLOAD_URL, form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

const deleteImageService = async (
  id: string
): Promise<ApiResponse<MessageResponse>> => {
  try {
    const response = await interceptedAxios.delete(`${BASE_UPLOAD_URL}/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof AxiosError && error.response?.data.error
          ? error.response?.data.error
          : "There was a problem with your request."
    };
  }
};

export { uploadImageService, deleteImageService };
