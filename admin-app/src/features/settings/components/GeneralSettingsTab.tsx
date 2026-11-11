import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  DEFAULT_MEDIA_CATALOG_SYNC_SETTING,
  MEDIA_CATALOG_SYNC_SETTING_KEY,
  parseMediaCatalogSyncSetting
} from "@/features/settings/lib/catalog-sync-setting";
import {
  useAppSetting,
  useSettingsMutations
} from "@/features/settings/hooks/useSettingsQueries";

import { Loader2Icon } from "lucide-react";

export default function GeneralSettingsTab() {
  const { data, isLoading } = useAppSetting(MEDIA_CATALOG_SYNC_SETTING_KEY);
  const { upsertSetting } = useSettingsMutations();

  const parsed = parseMediaCatalogSyncSetting(
    data?.value ?? DEFAULT_MEDIA_CATALOG_SYNC_SETTING
  );

  const [enabled, setEnabled] = useState(parsed.enabled);
  const [intervalDays, setIntervalDays] = useState(String(parsed.intervalDays));

  useEffect(() => {
    setEnabled(parsed.enabled);
    setIntervalDays(String(parsed.intervalDays));
  }, [parsed.enabled, parsed.intervalDays]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="h-4 w-4 animate-spin" />
        Loading general settings...
      </div>
    );
  }

  const save = () => {
    const days = Number(intervalDays);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      return;
    }

    upsertSetting.mutate({
      key: MEDIA_CATALOG_SYNC_SETTING_KEY,
      payload: {
        value: {
          enabled,
          intervalDays: days
        }
      }
    });
  };

  return (
    <div className="max-w-xl space-y-6 rounded-2xl border border-border/40 bg-background/35 p-6 shadow-xs backdrop-blur-xs">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Catalog sync schedule
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Periodically refresh non-review catalog metadata from Tenrai and
          related providers.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor="catalog-sync-enabled">Enable scheduled sync</Label>
          <p className="text-xs text-muted-foreground">
            Manual sync from media detail pages still works when disabled.
          </p>
        </div>
        <Checkbox
          id="catalog-sync-enabled"
          checked={enabled}
          onCheckedChange={(checked) => setEnabled(checked === true)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="catalog-sync-interval">Interval (days)</Label>
        <Input
          id="catalog-sync-interval"
          type="number"
          min={1}
          max={365}
          value={intervalDays}
          onChange={(event) => setIntervalDays(event.target.value)}
        />
      </div>

      <Button
        type="button"
        onClick={save}
        disabled={upsertSetting.isPending}
        className="gap-2"
      >
        {upsertSetting.isPending ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : null}
        Save general settings
      </Button>
    </div>
  );
}
