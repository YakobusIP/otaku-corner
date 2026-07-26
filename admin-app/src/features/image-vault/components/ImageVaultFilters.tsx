import { Fragment, useMemo, useState } from "react";

import { useImageVaultFilters } from "@/features/image-vault/components/ImageVaultFiltersContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { useIsMobile } from "@/hooks/useMobile";
import {
  useImageVaultCategories,
  useImageVaultModels
} from "@/features/image-vault/hooks/useImageVaultQueries";

import {
  IMAGE_VAULT_FILTER_FIELD_CONFIG,
  IMAGE_VAULT_FILTER_FIELD_OPTIONS,
  type ImageVaultFilterClause,
  type ImageVaultFilterField,
  type ImageVaultFilterGroup,
  type ImageVaultFilterOp,
  createEmptyClause,
  createGroupWithClause,
  getFilterOpLabel
} from "@/features/image-vault/lib/image-vault-filter-expression";
import {
  SENSITIVE_IMAGE_VISIBILITY_LABELS,
  SENSITIVE_IMAGE_VISIBILITY_OPTIONS,
  parseSensitiveImageVisibility
} from "@/types/image-vault.type";

import { PlusIcon, XIcon } from "lucide-react";

type ClauseEditorProps = {
  clause: ImageVaultFilterClause;
  modelOptions: Array<{ label: string; value: string }>;
  categoryOptions: Array<{ label: string; value: string }>;
  portalContainer?: HTMLElement | null;
  onChange: (clause: ImageVaultFilterClause) => void;
  onRemove: () => void;
};

function FilterClauseEditor({
  clause,
  modelOptions,
  categoryOptions,
  portalContainer = null,
  onChange,
  onRemove
}: ClauseEditorProps) {
  const isMobile = useIsMobile();
  const config = IMAGE_VAULT_FILTER_FIELD_CONFIG[clause.field];

  const setField = (field: ImageVaultFilterField) => {
    if (field === clause.field) return;
    const nextConfig = IMAGE_VAULT_FILTER_FIELD_CONFIG[field];
    onChange({
      ...clause,
      field,
      op: nextConfig.operators[0],
      values: []
    });
  };

  const setOp = (op: ImageVaultFilterOp) => {
    onChange({ ...clause, op });
  };

  const setValues = (values: string[]) => {
    onChange({ ...clause, values });
  };

  const valueEditor = (() => {
    if (config.valueKind === "id") {
      const options =
        clause.field === "model" ? modelOptions : categoryOptions;
      return (
        <MultiSelect
          key={`${clause.id}-${clause.field}-id`}
          options={options}
          defaultValue={clause.values}
          onValueChange={setValues}
          placeholder={
            clause.field === "model" ? "Select models" : "Select categories"
          }
          maxCount={1}
          searchable
          hideSelectAll
          autoSize={!isMobile}
          singleLine
          popoverPortalContainer={portalContainer}
          className="h-9 min-h-9 w-full border-border/60 md:h-8 md:min-h-8 md:w-auto md:min-w-36 md:border-0 md:bg-transparent md:shadow-none md:hover:bg-transparent"
        />
      );
    }

    if (config.valueKind === "enum" && config.enumOptions) {
      return (
        <MultiSelect
          key={`${clause.id}-${clause.field}-enum`}
          options={config.enumOptions as Array<{ label: string; value: string }>}
          defaultValue={clause.values}
          onValueChange={setValues}
          placeholder={`Select ${config.label.toLowerCase()}`}
          maxCount={2}
          hideSelectAll
          autoSize={!isMobile}
          singleLine
          popoverPortalContainer={portalContainer}
          className="h-9 min-h-9 w-full border-border/60 md:h-8 md:min-h-8 md:w-auto md:min-w-28 md:border-0 md:bg-transparent md:shadow-none md:hover:bg-transparent"
        />
      );
    }

    return (
      <Input
        key={`${clause.id}-${clause.field}-text`}
        value={clause.values[0] ?? ""}
        onChange={(event) => setValues([event.target.value])}
        placeholder={`Enter ${config.label.toLowerCase()}`}
        className="h-9 w-full md:h-8 md:min-w-36 md:border-0 md:bg-transparent md:px-1 md:shadow-none md:focus-visible:ring-0"
      />
    );
  })();

  return (
    <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-md border border-border/70 bg-background p-2 md:inline-flex md:h-8 md:w-auto md:grid-cols-none md:flex-row md:items-center md:gap-1 md:p-1.5">
      <Select
        value={clause.field}
        onValueChange={(value) => setField(value as ImageVaultFilterField)}
      >
        <SelectTrigger className="order-1 col-start-1 row-start-1 h-9 w-full border-border/60 md:col-auto md:row-auto md:h-7 md:w-auto md:min-w-0 md:gap-1 md:border-0 md:bg-transparent md:px-1.5 md:text-xs md:font-medium md:text-muted-foreground md:shadow-none md:hover:text-foreground md:focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent portalContainer={portalContainer} className="z-[60]">
          {IMAGE_VAULT_FILTER_FIELD_OPTIONS.map((option) => (
            <SelectItem key={option.field} value={option.field}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={clause.op}
        onValueChange={(value) => setOp(value as ImageVaultFilterOp)}
      >
        <SelectTrigger className="order-2 col-span-2 row-start-2 h-9 w-full border-border/60 md:col-auto md:row-auto md:h-7 md:w-auto md:min-w-0 md:gap-1 md:border-0 md:bg-transparent md:px-1.5 md:shadow-none md:focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent portalContainer={portalContainer} className="z-[60]">
          {config.operators.map((op) => (
            <SelectItem key={op} value={op}>
              {getFilterOpLabel(clause.field, op)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="order-3 col-span-2 row-start-3 min-w-0 w-full md:col-auto md:row-auto md:w-auto">
        {valueEditor}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="order-4 col-start-2 row-start-1 h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground md:col-auto md:row-auto md:ml-0.5 md:h-6 md:w-6"
        aria-label="Remove filter"
        onClick={onRemove}
      >
        <XIcon className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

type FieldPickerProps = {
  onPick: (field: ImageVaultFilterField) => void;
  triggerLabel: string;
  variant?: "outline" | "ghost";
  className?: string;
  portalContainer?: HTMLElement | null;
};

function FieldPicker({
  onPick,
  triggerLabel,
  variant = "outline",
  className,
  portalContainer = null
}: FieldPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size="sm"
          className={className ?? "h-8 shrink-0 gap-1 px-2"}
        >
          <PlusIcon className="h-3.5 w-3.5" />
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="z-[60] w-48 p-1"
        portalContainer={portalContainer}
      >
        <div className="flex flex-col">
          {IMAGE_VAULT_FILTER_FIELD_OPTIONS.map((option) => (
            <Button
              key={option.field}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 justify-start font-normal"
              onClick={() => {
                onPick(option.field);
                setOpen(false);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type ImageVaultFiltersProps = {
  portalContainer?: HTMLElement | null;
};

export default function ImageVaultFilters({
  portalContainer = null
}: ImageVaultFiltersProps) {
  const { state, setState, setGroups } = useImageVaultFilters();
  const { data: models = [] } = useImageVaultModels(true);
  const { data: categories = [] } = useImageVaultCategories(true);

  const modelOptions = useMemo(
    () =>
      models.map((model) => ({
        label: `${model.name} (${model.provider})`,
        value: model.id
      })),
    [models]
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id
      })),
    [categories]
  );

  const addAndGroup = (field: ImageVaultFilterField) => {
    setGroups((prev) => [...prev, createGroupWithClause(field)]);
  };

  const addOrClause = (groupId: string, field: ImageVaultFilterField) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, clauses: [...group.clauses, createEmptyClause(field)] }
          : group
      )
    );
  };

  const updateClause = (
    groupId: string,
    clauseId: string,
    next: ImageVaultFilterClause
  ) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              clauses: group.clauses.map((clause) =>
                clause.id === clauseId ? next : clause
              )
            }
          : group
      )
    );
  };

  const removeClause = (groupId: string, clauseId: string) => {
    setGroups((prev) =>
      prev
        .map((group) => {
          if (group.id !== groupId) return group;
          return {
            ...group,
            clauses: group.clauses.filter((clause) => clause.id !== clauseId)
          };
        })
        .filter((group) => group.clauses.length > 0)
    );
  };

  const clearFilters = () => {
    setGroups([]);
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 md:flex-row md:flex-wrap md:items-center">
      <Select
        value={state.sensitiveImageVisibility}
        onValueChange={(value) => {
          const parsed = parseSensitiveImageVisibility(value);
          if (parsed) {
            setState({ sensitiveImageVisibility: parsed });
          }
        }}
      >
        <SelectTrigger className="h-9 w-full shrink-0 md:h-8 md:w-auto md:min-w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent portalContainer={portalContainer} className="z-[60]">
          {SENSITIVE_IMAGE_VISIBILITY_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {SENSITIVE_IMAGE_VISIBILITY_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div
        className="hidden h-5 w-px shrink-0 bg-border/70 md:block"
        aria-hidden
      />

      {state.groups.length === 0 ? (
        <FieldPicker
          onPick={addAndGroup}
          triggerLabel="Add filter"
          portalContainer={portalContainer}
          className="h-9 w-full justify-center gap-1 md:h-8 md:w-auto md:justify-start md:px-2"
        />
      ) : (
        <Fragment>
          <div className="flex w-full flex-col gap-2 md:contents">
            {state.groups.map((group, groupIndex) => (
              <Fragment key={group.id}>
                {groupIndex > 0 ? (
                  <span className="shrink-0 self-center text-xs font-semibold uppercase text-muted-foreground">
                    and
                  </span>
                ) : null}
                <FilterGroupBubble
                  group={group}
                  modelOptions={modelOptions}
                  categoryOptions={categoryOptions}
                  portalContainer={portalContainer}
                  onUpdateClause={(clauseId, next) =>
                    updateClause(group.id, clauseId, next)
                  }
                  onRemoveClause={(clauseId) =>
                    removeClause(group.id, clauseId)
                  }
                  onAddOr={(field) => addOrClause(group.id, field)}
                />
              </Fragment>
            ))}
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <FieldPicker
              onPick={addAndGroup}
              triggerLabel="AND"
              portalContainer={portalContainer}
              className="h-9 flex-1 justify-center gap-1 md:h-8 md:flex-none md:justify-start md:px-2"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 shrink-0 px-3 md:h-8 md:px-2"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>
        </Fragment>
      )}
    </div>
  );
}

type FilterGroupBubbleProps = {
  group: ImageVaultFilterGroup;
  modelOptions: Array<{ label: string; value: string }>;
  categoryOptions: Array<{ label: string; value: string }>;
  portalContainer?: HTMLElement | null;
  onUpdateClause: (clauseId: string, next: ImageVaultFilterClause) => void;
  onRemoveClause: (clauseId: string) => void;
  onAddOr: (field: ImageVaultFilterField) => void;
};

function FilterGroupBubble({
  group,
  modelOptions,
  categoryOptions,
  portalContainer = null,
  onUpdateClause,
  onRemoveClause,
  onAddOr
}: FilterGroupBubbleProps) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-md border border-dashed border-border/70 bg-muted/15 p-2 md:inline-flex md:w-auto md:flex-row md:flex-wrap md:items-center md:gap-1.5 md:p-1.5">
      <span className="hidden shrink-0 text-muted-foreground md:inline">
        (
      </span>
      {group.clauses.map((clause, clauseIndex) => (
        <Fragment key={clause.id}>
          {clauseIndex > 0 ? (
            <span className="shrink-0 self-center text-xs font-semibold uppercase text-muted-foreground">
              or
            </span>
          ) : null}
          <FilterClauseEditor
            clause={clause}
            modelOptions={modelOptions}
            categoryOptions={categoryOptions}
            portalContainer={portalContainer}
            onChange={(next) => onUpdateClause(clause.id, next)}
            onRemove={() => onRemoveClause(clause.id)}
          />
        </Fragment>
      ))}
      <FieldPicker
        onPick={onAddOr}
        triggerLabel="OR"
        variant="ghost"
        portalContainer={portalContainer}
        className="h-9 w-full justify-center gap-1 md:h-8 md:w-auto md:justify-start md:px-2"
      />
      <span className="hidden shrink-0 text-muted-foreground md:inline">
        )
      </span>
    </div>
  );
}
