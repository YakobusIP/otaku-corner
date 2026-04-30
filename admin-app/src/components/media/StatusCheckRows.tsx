import type { StatusCheck } from "@/components/data-table/DataTableStatuses";
import { StatusProgressBar } from "@/components/ui/status-progress-bar";

import { cn } from "@/lib/utils";

type Props = {
  checks: StatusCheck[];
  barAnimateIn?: boolean;
};

export default function StatusCheckRows({ checks, barAnimateIn }: Props) {
  const conditionSuccess = checks.filter((check) => check.condition).length;
  const checksCount = checks.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <StatusProgressBar
          key={barAnimateIn ? "open" : "closed"}
          className="h-2 min-w-[7rem] flex-1"
          value={(conditionSuccess / checksCount) * 100}
          animateIn={barAnimateIn}
        />
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {conditionSuccess} / {checksCount}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 desktop:flex-row desktop:flex-wrap desktop:gap-x-4 desktop:gap-y-1">
        {checks.map((check) => {
          const { key, Trigger, condition, triggerColor, message } = check;
          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-2 text-sm",
                condition ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Trigger
                className={cn(
                  "h-4 w-4 shrink-0",
                  condition ? triggerColor.success : triggerColor.failed
                )}
              />
              <span className="whitespace-nowrap">
                {condition ? message.success : message.failed}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
