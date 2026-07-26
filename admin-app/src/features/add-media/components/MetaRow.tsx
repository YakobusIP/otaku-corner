import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export default function MetaRow({ icon: Icon, label, value }: Props) {
  return (
    <div className="flex min-w-0 gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="wrap-break-word leading-snug">{value}</p>
      </div>
    </div>
  );
}
