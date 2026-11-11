import AuditLogTable from "@/features/notification-center/components/AuditLogTable";
import OpenConflictsTable from "@/features/notification-center/components/OpenConflictsTable";
import SyncRunsTable from "@/features/notification-center/components/SyncRunsTable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

const TABS = [
  { id: "open-conflicts", label: "Open Conflicts", content: OpenConflictsTable },
  { id: "sync-runs", label: "Sync Runs", content: SyncRunsTable },
  { id: "audit-log", label: "Audit Log", content: AuditLogTable }
] as const;

export default function NotificationCenterTabs() {
  return (
    <Tabs defaultValue={TABS[0].id} className="w-full">
      <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => {
        const Panel = tab.content;
        return (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            <Panel />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
