import { Fragment, type SetStateAction, Suspense, lazy, useState } from "react";

import ImageVaultUploadDialog from "@/components/image-vault/ImageVaultUploadDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import {
  ChevronDownIcon,
  FolderIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon
} from "lucide-react";

const ModelManagementDialog = lazy(
  () => import("@/components/image-vault/models/ModelManagementDialog")
);
const CategoryManagementDialog = lazy(
  () => import("@/components/image-vault/categories/CategoryManagementDialog")
);

type DialogType = "upload" | "models" | "categories";

export default function ImageVaultManageDropdown() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<DialogType | null>(null);

  const openDialogFromMenu = (dialog: DialogType) => (e: Event) => {
    e.preventDefault();
    setMenuOpen(false);
    setActiveDialog(dialog);
  };

  const makeDialogSetter =
    (dialog: DialogType) => (next: SetStateAction<boolean>) => {
      setActiveDialog((prevDialog) => {
        const prevOpen = prevDialog === dialog;
        const nextOpen = typeof next === "function" ? next(prevOpen) : next;
        return nextOpen ? dialog : null;
      });
    };

  return (
    <Fragment>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Manage image vault"
            className="h-9 w-9 shrink-0 gap-2 border border-white/15 bg-linear-to-r from-[#4F8CFF] via-[#7C6CF6] to-[#A855F7] px-0 text-white shadow-md transition-[filter,box-shadow] hover:bg-linear-to-r hover:from-[#4F8CFF] hover:via-[#7C6CF6] hover:to-[#A855F7] hover:text-white hover:brightness-110 focus-visible:ring-white/35 active:brightness-95 md:w-auto md:px-3"
          >
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden md:inline">Manage</span>
            <ChevronDownIcon className="hidden h-4 w-4 opacity-80 md:inline-block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-50 border-border/60 bg-popover/95 backdrop-blur-md"
        >
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Image Vault
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="gap-2"
            onSelect={openDialogFromMenu("upload")}
          >
            <PlusIcon className="h-4 w-4" />
            Upload
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onSelect={openDialogFromMenu("models")}
          >
            <SparklesIcon className="h-4 w-4" />
            Models
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onSelect={openDialogFromMenu("categories")}
          >
            <FolderIcon className="h-4 w-4" />
            Categories
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeDialog === "upload" ? (
        <ImageVaultUploadDialog
          open
          onOpenChange={makeDialogSetter("upload")}
        />
      ) : null}

      {activeDialog === "models" ? (
        <Suspense fallback={null}>
          <ModelManagementDialog
            open
            onOpenChange={makeDialogSetter("models")}
          />
        </Suspense>
      ) : null}

      {activeDialog === "categories" ? (
        <Suspense fallback={null}>
          <CategoryManagementDialog
            open
            onOpenChange={makeDialogSetter("categories")}
          />
        </Suspense>
      ) : null}
    </Fragment>
  );
}
