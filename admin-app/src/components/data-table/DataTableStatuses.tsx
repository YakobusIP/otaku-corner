import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { StatusProgressBar } from "@/components/ui/status-progress-bar";

import { cn } from "@/lib/utils";

import { CircleCheckIcon, InfoIcon, LucideIcon } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

type Checks = {
  key: string;
  Trigger: LucideIcon;
  condition: boolean;
  triggerColor: {
    success: string;
    failed: string;
  };
  message: {
    success: string;
    failed: string;
  };
};

type Props = {
  checks: Checks[];
};

export default function DataTableStatuses({ checks }: Props) {
  const conditionSuccess = checks.filter((check) => check.condition).length;
  const checksCount = checks.length;

  return (
    <div className="flex items-center gap-2 w-full">
      <StatusProgressBar
        className="w-1/3 xl:w-1/2 h-2"
        value={(conditionSuccess / checksCount) * 100}
      />
      <p>
        {conditionSuccess} / {checksCount}
      </p>
      <Dialog>
        <DialogTrigger asChild>
          {checksCount === conditionSuccess ? (
            <CircleCheckIcon className="w-4 h-4 text-green-700 hover:cursor-pointer" />
          ) : (
            <InfoIcon className="w-4 h-4 hover:cursor-pointer" />
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Status Details</DialogTitle>
            <DialogDescription>Media detail status breakdown</DialogDescription>
          </DialogHeader>
          <div className="space-y-1 text-sm">
            {checks.map((check) => {
              const { key, Trigger, condition, triggerColor, message } = check;
              return (
                <Fragment key={key}>
                  <span className={cn("flex justify-between")}>
                    <Trigger
                      className={cn(
                        "w-4 h-4",
                        condition ? triggerColor.success : triggerColor.failed
                      )}
                    />
                    <p>{condition ? message.success : message.failed}</p>
                  </span>
                  <Separator />
                </Fragment>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
