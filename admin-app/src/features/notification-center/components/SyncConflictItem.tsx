import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  formatConflictValue,
  getCatalogFieldLabel
} from "@/features/notification-center/lib/catalog-field-labels";
import { getConflictRuleLabel } from "@/features/notification-center/lib/conflict-rule-labels";

import type { MediaSyncFieldResolutionChoice } from "@/types/media-sync-resolve.type";
import type { MediaSyncItem } from "@/types/media-sync.type";

import { Loader2Icon } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  buildBulkFieldChoiceMap,
  listBlockedAcceptUpstreamFields
} from "@/features/notification-center/lib/conflict-resolve-policy";

type FieldChoiceMap = Record<string, MediaSyncFieldResolutionChoice | undefined>;

type SyncConflictItemProps = {
  item: MediaSyncItem;
  isResolving: boolean;
  showRunOrigin?: boolean;
  onResolveFields: (
    item: MediaSyncItem,
    resolutions: { field: string; choice: MediaSyncFieldResolutionChoice }[]
  ) => void;
  onAcceptAll: (item: MediaSyncItem) => void;
  onKeepAll: (item: MediaSyncItem) => void;
};

const mediaDetailPath = (item: MediaSyncItem): string => {
  switch (item.mediaType) {
    case "ANIME":
      return `/anime/${item.mediaId}`;
    case "MANGA":
      return `/manga/${item.mediaId}`;
    case "LIGHT_NOVEL":
      return `/light-novel/${item.mediaId}`;
  }
};

const formatResolutionChoice = (
  choice: MediaSyncFieldResolutionChoice
): string => (choice === "accept_upstream" ? "Accepted upstream" : "Kept local");

export default function SyncConflictItem({
  item,
  isResolving,
  showRunOrigin = true,
  onResolveFields,
  onAcceptAll,
  onKeepAll
}: SyncConflictItemProps) {
  const conflicts = useMemo(() => item.conflicts ?? [], [item.conflicts]);
  const savedResolutions = useMemo(
    () => item.fieldResolutions ?? {},
    [item.fieldResolutions]
  );
  const [fieldChoices, setFieldChoices] = useState<FieldChoiceMap>({});
  const blockedAcceptFields = useMemo(
    () => listBlockedAcceptUpstreamFields(item.mediaType, conflicts),
    [conflicts, item.mediaType]
  );
  const blockedAcceptFieldSet = useMemo(
    () => new Set(blockedAcceptFields),
    [blockedAcceptFields]
  );

  useEffect(() => {
    setFieldChoices({});
  }, [item.id, item.version]);

  const selectedResolutions = useMemo(
    () =>
      conflicts
        .filter((conflict) => fieldChoices[conflict.field])
        .map((conflict) => ({
          field: conflict.field,
          choice: fieldChoices[conflict.field] as MediaSyncFieldResolutionChoice
        })),
    [conflicts, fieldChoices]
  );

  const setFieldChoice = (
    field: string,
    choice: MediaSyncFieldResolutionChoice
  ) => {
    setFieldChoices((current) => ({
      ...current,
      [field]: choice
    }));
  };

  const applyBulkChoice = (choice: MediaSyncFieldResolutionChoice) => {
    setFieldChoices(
      buildBulkFieldChoiceMap(item.mediaType, conflicts, choice)
    );
  };

  const handleApplySelected = () => {
    if (selectedResolutions.length === 0) {
      return;
    }
    onResolveFields(item, selectedResolutions);
  };

  const handleAcceptAll = () => {
    if (blockedAcceptFields.length > 0) {
      return;
    }
    onAcceptAll(item);
  };

  const isOpenConflict = item.outcome === "CONFLICT";
  const savedResolutionEntries = Object.entries(savedResolutions);

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{item.outcome}</Badge>
        {item.isLegacyUntrusted ? (
          <Badge variant="secondary">Legacy conflict</Badge>
        ) : null}
        <span>
          {item.mediaType} #{item.mediaId}
          {item.mediaTitle ? ` — ${item.mediaTitle}` : ""}
        </span>
        {showRunOrigin && item.syncRunId ? (
          <span className="text-xs text-muted-foreground">
            Run {item.syncRunId}
          </span>
        ) : null}
        <span className="text-xs text-muted-foreground">v{item.version}</span>
        <Link
          to={mediaDetailPath(item)}
          className="text-xs text-primary underline-offset-4 hover:underline"
        >
          Open detail
        </Link>
      </div>

      {item.isLegacyUntrusted ? (
        <p className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          This conflict predates trusted three-way baseline snapshots. Base values
          are not recoverable here. Resolve using the recorded local and upstream
          values below.
        </p>
      ) : null}

      {blockedAcceptFields.length > 0 ? (
        <p className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          Upstream is empty for required fields ({blockedAcceptFields.join(", ")}
          ). Bulk accept upstream is disabled; keep local for those fields instead.
        </p>
      ) : null}

      {item.errorMessage ? (
        <p className="mt-2 text-muted-foreground">{item.errorMessage}</p>
      ) : null}

      {savedResolutionEntries.length > 0 ? (
        <div className="mt-3 rounded-md border border-border/40 bg-background/40 px-3 py-2">
          <p className="font-medium">Recorded field decisions</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {savedResolutionEntries.map(([field, choice]) => (
              <li key={`${item.id}-saved-${field}`}>
                {getCatalogFieldLabel(field)}: {formatResolutionChoice(choice)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {conflicts.length > 0 ? (
        <Fragment>
          {isOpenConflict ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isResolving}
                onClick={() => applyBulkChoice("keep_local")}
              >
                Select remaining keep local
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isResolving}
                onClick={() => applyBulkChoice("accept_upstream")}
              >
                Select remaining accept upstream
              </Button>
            </div>
          ) : null}

          <ul className="mt-3 space-y-2">
            {conflicts.map((conflict) => {
              const selected = fieldChoices[conflict.field];
              const savedChoice = savedResolutions[conflict.field];
              const acceptBlocked = blockedAcceptFieldSet.has(conflict.field);
              return (
                <li
                  key={`${item.id}-${conflict.field}-${conflict.rule}`}
                  className="rounded-md border border-border/40 bg-background/40 px-3 py-2"
                >
                  <p className="font-medium">
                    {getCatalogFieldLabel(conflict.field)}:{" "}
                    {getConflictRuleLabel(conflict.rule)}
                  </p>
                  <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
                    <p>
                      <span className="font-medium text-foreground">Base:</span>{" "}
                      {item.isLegacyUntrusted
                        ? "Unavailable for legacy conflicts"
                        : formatConflictValue(conflict.base)}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Local:</span>{" "}
                      {formatConflictValue(conflict.local)}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Upstream:
                      </span>{" "}
                      {formatConflictValue(conflict.upstream)}
                    </p>
                  </div>

                  {savedChoice ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Saved choice: {formatResolutionChoice(savedChoice)}
                    </p>
                  ) : null}

                  {isOpenConflict ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          selected === "keep_local" ? "default" : "outline"
                        }
                        disabled={isResolving}
                        onClick={() =>
                          setFieldChoice(conflict.field, "keep_local")
                        }
                      >
                        Keep local
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          selected === "accept_upstream" ? "default" : "outline"
                        }
                        disabled={isResolving || acceptBlocked}
                        title={
                          acceptBlocked
                            ? "Upstream is empty for this required field"
                            : undefined
                        }
                        onClick={() =>
                          setFieldChoice(conflict.field, "accept_upstream")
                        }
                      >
                        Accept upstream
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Fragment>
      ) : null}

      {isOpenConflict ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={isResolving || selectedResolutions.length === 0}
            onClick={handleApplySelected}
          >
            {isResolving ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Apply selected ({selectedResolutions.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isResolving || blockedAcceptFields.length > 0}
            title={
              blockedAcceptFields.length > 0
                ? "Resolve required empty-upstream fields with keep local first"
                : undefined
            }
            onClick={handleAcceptAll}
          >
            Accept all remaining upstream
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isResolving}
            onClick={() => onKeepAll(item)}
          >
            Keep all remaining local
          </Button>
        </div>
      ) : null}
    </div>
  );
}
