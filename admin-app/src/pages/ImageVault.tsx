import { useEffect, useState } from "react";

import {
  ImageVaultFiltersProvider,
  useImageVaultFilters
} from "@/components/context/ImageVaultFiltersContext";
import ImageVaultDetailDialog from "@/components/image-vault/ImageVaultDetailDialog";
import ImageVaultFilters from "@/components/image-vault/ImageVaultFilters";
import ImageVaultListSection from "@/components/image-vault/ImageVaultListSection";
import ImageVaultManageDropdown from "@/components/image-vault/ImageVaultManageDropdown";
import ImageVaultUploadDialog from "@/components/image-vault/ImageVaultUploadDialog";
import AdminLayout from "@/components/layout/AdminLayout";

import { useImageVaultListPage } from "@/hooks/useImageVaultListPage";

function ImageVaultContent() {
  const { state } = useImageVaultFilters();
  const listQuery = useImageVaultListPage(true);

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
          hideExplicitImages={state.hideExplicitImages}
          onSelectImage={(image) => setSelectedId(image.id)}
          onUploadClick={() => setEmptyUploadOpen(true)}
        />
      </div>

      <ImageVaultUploadDialog
        open={emptyUploadOpen}
        onOpenChange={setEmptyUploadOpen}
      />
      <ImageVaultDetailDialog
        imageId={selectedId}
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        hideExplicitImages={state.hideExplicitImages}
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
