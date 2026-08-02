import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

import {
  useAppSetting,
  useSettingsMutations
} from "@/features/settings/hooks/useSettingsQueries";
import {
  decimalWeightToPercentage,
  getWeightsSum,
  hasValidFixedScoreWeightPercentages,
  isValidScoreWeightsPercentageSum,
  parseNumericWeightsObject,
  percentageWeightToDecimal
} from "@/features/settings/lib/score-weights";
import {
  REVIEW_SCORE_WEIGHT_FIELDS,
  type ReviewPersonalScoreWeightsMediaType
} from "@/features/settings/lib/setting-keys";
import { Loader2Icon, SaveIcon } from "lucide-react";

type Props = {
  mediaType: ReviewPersonalScoreWeightsMediaType;
  settingKey: string;
  title: string;
};

export default function ScoreWeightsEditor({
  mediaType,
  settingKey,
  title
}: Props) {
  const fields = REVIEW_SCORE_WEIGHT_FIELDS[mediaType];
  const settingQuery = useAppSetting(settingKey);
  const { upsertSetting } = useSettingsMutations();
  const [percentages, setPercentages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!settingQuery.data) {
      return;
    }

    const savedWeights = parseNumericWeightsObject(settingQuery.data.value);
    const nextPercentages: Record<string, string> = {};

    for (const field of fields) {
      const decimal = savedWeights[field.key];
      nextPercentages[field.key] =
        typeof decimal === "number"
          ? String(decimalWeightToPercentage(decimal))
          : "";
    }

    setPercentages(nextPercentages);
  }, [fields, settingQuery.data]);

  const savedWeights = useMemo(
    () => parseNumericWeightsObject(settingQuery.data?.value),
    [settingQuery.data]
  );

  const parsedPercentages = useMemo(() => {
    const next: Record<string, number> = {};

    for (const field of fields) {
      const parsedValue = Number(percentages[field.key]);
      if (Number.isFinite(parsedValue)) {
        next[field.key] = parsedValue;
      }
    }

    return next;
  }, [fields, percentages]);

  const parsedWeights = useMemo(() => {
    const next: Record<string, number> = {};

    for (const field of fields) {
      const percentage = parsedPercentages[field.key];
      if (typeof percentage === "number") {
        next[field.key] = percentageWeightToDecimal(percentage);
      }
    }

    return next;
  }, [fields, parsedPercentages]);

  const isDirty = useMemo(
    () =>
      fields.some((field) => {
        const saved = savedWeights[field.key];
        const current = parsedWeights[field.key];

        if (typeof saved !== "number" || typeof current !== "number") {
          return (percentages[field.key] ?? "").trim().length > 0;
        }

        return saved !== current;
      }),
    [fields, parsedWeights, percentages, savedWeights]
  );

  const percentagesSum = getWeightsSum(parsedPercentages);
  const canSave =
    isDirty &&
    hasValidFixedScoreWeightPercentages(fields, parsedPercentages) &&
    isValidScoreWeightsPercentageSum(parsedPercentages) &&
    !upsertSetting.isPending;

  const handlePercentageChange = (key: string, nextValue: string) => {
    setPercentages((current) => ({
      ...current,
      [key]: nextValue
    }));
  };

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    upsertSetting.mutate({
      key: settingKey,
      payload: {
        value: parsedWeights
      }
    });
  };

  if (settingQuery.isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center gap-2 rounded-lg border border-border/40 bg-background/35 p-4 text-sm text-muted-foreground">
        <Loader2Icon className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (settingQuery.isError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load {title} weights.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 rounded-lg border border-border/40 bg-background/35 p-4 shadow-xs backdrop-blur-xs">
      <h3 className="text-sm font-semibold">{title}</h3>

      <div className="flex flex-col gap-2">
        {fields.map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-between gap-3"
          >
            <Label
              htmlFor={`${settingKey}-${field.key}`}
              className="min-w-0 flex-1 text-sm font-normal"
            >
              {field.label}
            </Label>
            <div className="relative w-20 shrink-0">
              <Input
                id={`${settingKey}-${field.key}`}
                type="number"
                min={0}
                max={100}
                step={1}
                value={percentages[field.key] ?? ""}
                onChange={(event) =>
                  handlePercentageChange(field.key, event.target.value)
                }
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                %
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-border/40 pt-3">
        <p
          className={cn(
            "text-xs tabular-nums",
            isValidScoreWeightsPercentageSum(parsedPercentages)
              ? "text-muted-foreground"
              : "text-amber-300"
          )}
        >
          Total: {percentagesSum.toFixed(0)}%
          {isValidScoreWeightsPercentageSum(parsedPercentages)
            ? ""
            : " (must be 100%)"}
        </p>
        <Button
          type="button"
          size="sm"
          className="w-full gap-2"
          onClick={handleSave}
          disabled={!canSave}
        >
          {upsertSetting.isPending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <SaveIcon className="h-4 w-4" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}
