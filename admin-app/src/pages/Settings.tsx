import { useEffect } from "react";

import AdminLayout from "@/components/layout/AdminLayout";

import SettingsTabs from "@/features/settings/components/SettingsTabs";

export default function Settings() {
  useEffect(() => {
    document.title = "Settings | Otaku Corner Admin";
  }, []);

  return (
    <AdminLayout
      title="Settings"
      description="Manage application-wide configuration."
    >
      <SettingsTabs />
    </AdminLayout>
  );
}
