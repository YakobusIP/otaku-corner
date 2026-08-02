import { useEffect } from "react";

import AdminLayout from "@/components/layout/AdminLayout";
import EntityManagementTabs from "@/features/entity-management/components/EntityManagementTabs";

export default function EntityManagement() {
  useEffect(() => {
    document.title = "Entity Management | Otaku Corner Admin";
  }, []);

  return (
    <AdminLayout
      title="Entity Management"
      description="Manage authors, genres, studios, and themes from added media."
    >
      <EntityManagementTabs />
    </AdminLayout>
  );
}
