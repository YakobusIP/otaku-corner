type ApiResponseSuccess<T> = {
  success: true;
  data: T;
};

type ApiResponseListSuccess<T> = {
  success: true;
  data: {
    data: T;
    metadata: MetadataResponse;
  };
};

type ApiResponseError = {
  success: false;
  error: string;
};

type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

type ApiResponseList<T> = ApiResponseListSuccess<T> | ApiResponseError;

type MessageResponse = {
  message: string;
};

type MetadataResponse = {
  currentPage: number;
  limitPerPage: number;
  pageCount: number;
  itemCount: number;
};

export type { ApiResponse, ApiResponseList, MessageResponse, MetadataResponse };
