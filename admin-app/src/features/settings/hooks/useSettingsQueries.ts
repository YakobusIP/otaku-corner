import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { settingsService } from "@/services/settings.service";

import type { UpsertAppSettingPayload } from "@/types/settings.type";

import { mediaKeys, settingKeys } from "@/lib/query-keys";
import {
  type ReviewPersonalScoreWeightsMediaType,
  REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS
} from "@/features/settings/lib/setting-keys";
import { parseNumericWeightsObject } from "@/features/settings/lib/score-weights";

export const useAppSettingsList = () =>
  useQuery({
    queryKey: settingKeys.lists(),
    queryFn: async () => {
      const result = await settingsService.list();
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    }
  });

export const useAppSetting = (key: string) =>
  useQuery({
    queryKey: settingKeys.detail(key),
    queryFn: async () => {
      const result = await settingsService.getByKey(key);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    }
  });

export const useReviewPersonalScoreWeights = (
  mediaType: ReviewPersonalScoreWeightsMediaType
) => {
  const key = REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS[mediaType];
  const query = useAppSetting(key);

  return {
    ...query,
    weights: parseNumericWeightsObject(query.data?.value)
  };
};

export const useSettingsMutations = () => {
  const queryClient = useQueryClient();

  const upsertSetting = useMutation({
    mutationFn: async (input: { key: string; payload: UpsertAppSettingPayload }) => {
      const result = await settingsService.upsert(input.key, input.payload);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: settingKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: settingKeys.detail(data.key)
        }),
        // Scores will finish updating shortly after the background job runs.
        queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
        queryClient.invalidateQueries({ queryKey: settingKeys.all })
      ]);
      const queuedCount = data.recalculationQueuedCount ?? 0;
      toast.success(
        `Weights saved. Recalculating ${queuedCount} personal scores in the background.`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save setting");
    }
  });

  return {
    upsertSetting
  };
};
