import { useEffect, useState } from "react";

import {
  ImageVaultFiltersProvider,
  useImageVaultFilters
} from "@/features/image-vault/components/ImageVaultFiltersContext";
import ImageVaultDetailDialog from "@/features/image-vault/components/ImageVaultDetailDialog";
import ImageVaultFilters from "@/features/image-vault/components/ImageVaultFilters";
import ImageVaultListSection from "@/features/image-vault/components/ImageVaultListSection";
import ImageVaultManageDropdown from "@/features/image-vault/components/ImageVaultManageDropdown";
import ImageVaultUploadDialog from "@/features/image-vault/components/ImageVaultUploadDialog";
import AdminLayout from "@/components/layout/AdminLayout";

import { useImageVaultListPage } from "@/features/image-vault/hooks/useImageVaultListPage";

function ImageVaultContent() {
  const { state } = useImageVaultFilters();
  const listQuery = useImageVaultListPage();

  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const [emptyUploadOpen, setEmptyUploadOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Image Vault | Otaku Corner Admin";
  }, []);

  return (
    <AdminLayout
      title="Image Vault"
      description="Private catalog of AI and human images with lineage tracking."
      scrollContainerRef={setScrollRoot}
      actions={<ImageVaultManageDropdown />}
    >
      <div className="space-y-4">
        <ImageVaultFilters />
        <ImageVaultListSection
          listQuery={listQuery}
          scrollRoot={scrollRoot}
          onSelectImage={(image) => setSelectedId(image.id)}
          onUploadClick={() => setEmptyUploadOpen(true)}
        />
      </div>

      <ImageVaultUploadDialog
        open={emptyUploadOpen}
        onOpenChange={setEmptyUploadOpen}
        sensitiveImageVisibility={state.sensitiveImageVisibility}
      />
      <ImageVaultDetailDialog
        imageId={selectedId}
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        sensitiveImageVisibility={state.sensitiveImageVisibility}
      />
    </AdminLayout>
  );
}

export default function ImageVault() {
  return (
    <ImageVaultFiltersProvider>
      <ImageVaultContent />
    </ImageVaultFiltersProvider>
  );
}
