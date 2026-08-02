export type AppSetting = {
  key: string;
  value: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  recalculationQueuedCount?: number;
};

export type UpsertAppSettingPayload = {
  value: Record<string, unknown>;
};
