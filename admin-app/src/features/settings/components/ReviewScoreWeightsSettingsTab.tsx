import ScoreWeightsEditor from "@/features/settings/components/ScoreWeightsEditor";

import { REVIEW_SCORE_WEIGHT_SETTING_CONFIG } from "@/features/settings/lib/setting-keys";

export default function ReviewScoreWeightsSettingsTab() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Percentages must total 100% per media type. Saving recalculates personal
        scores in the background.
      </p>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {REVIEW_SCORE_WEIGHT_SETTING_CONFIG.map((config) => (
          <ScoreWeightsEditor
            key={config.id}
            mediaType={config.id}
            settingKey={config.settingKey}
            title={config.label}
          />
        ))}
      </div>
    </div>
  );
}
