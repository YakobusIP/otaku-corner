type ApiResponseSuccess<T> = {
  success: true;
  data: T;
};

type ApiResponseError = {
  success: false;
  error: string;
};

type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

type MessageResponse = {
  message: string;
};

export type {
  ApiResponseSuccess,
  ApiResponseError,
  ApiResponse,
  MessageResponse
};
