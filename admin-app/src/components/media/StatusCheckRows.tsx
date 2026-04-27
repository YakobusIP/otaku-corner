import type { StatusCheck } from "@/components/data-table/DataTableStatuses";
import { StatusProgressBar } from "@/components/ui/status-progress-bar";

import { cn } from "@/lib/utils";

type Props = {
  checks: StatusCheck[];
};

export default function StatusCheckRows({ checks }: Props) {
  const conditionSuccess = checks.filter((check) => check.condition).length;
  const checksCount = checks.length;

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <StatusProgressBar
          className="h-2 w-full"
          value={(conditionSuccess / checksCount) * 100}
        />
        <span className="text-xs text-muted-foreground">
          {conditionSuccess} / {checksCount}
        </span>
      </div>
      <div className="space-y-1.5">
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
              <span>{condition ? message.success : message.failed}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
