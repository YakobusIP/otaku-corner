type ApiResponse<T> = {
  data: T;
};

type ApiResponseList<T> = {
  data: {
    data: T;
    metadata: MetadataResponse;
  };
};

type ApiResponseError = {
  error: string;
};

type MetadataResponse = {
  page: number;
  limit: number;
  pageCount: number;
  itemCount: number;
};

export type {
  ApiResponse,
  ApiResponseList,
  ApiResponseError,
  MetadataResponse
};
