export type MediaSyncFieldResolutionChoice = "accept_upstream" | "keep_local";

export type MediaSyncFieldResolution = {
  field: string;
  choice: MediaSyncFieldResolutionChoice;
};

export type ResolveMediaSyncFieldsRequest = {
  expectedVersion: number;
  resolutions: MediaSyncFieldResolution[];
};

export type MediaSyncConflictActionRequest = {
  expectedVersion: number;
};
