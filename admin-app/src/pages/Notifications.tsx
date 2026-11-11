import { useEffect } from "react";

import AdminLayout from "@/components/layout/AdminLayout";
import NotificationCenterTabs from "@/features/notification-center/components/NotificationCenterTabs";

export default function Notifications() {
  useEffect(() => {
    document.title = "Notification Center | Otaku Corner Admin";
  }, []);

  return (
    <AdminLayout
      title="Notification Center"
      description="Catalog sync runs and audit history"
    >
      <NotificationCenterTabs />
    </AdminLayout>
  );
}
