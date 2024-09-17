import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import AuthorManagement from "@/components/admin/entity-management/author-management/AuthorManagement";
import GenreManagement from "@/components/admin/entity-management/genre-management/GenreManagement";
import StudioManagement from "@/components/admin/entity-management/studio-management/StudioManagement";
import ThemeManagement from "@/components/admin/entity-management/theme-management/ThemeManagement";

type Props = {
  openDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  resetAuthor: () => Promise<void>;
  resetGenre: () => Promise<void>;
  resetStudio: () => Promise<void>;
  resetTheme: () => Promise<void>;
};

export default function EntityManagement({
  openDialog,
  setOpenDialog,
  resetAuthor,
  resetGenre,
  resetStudio,
  resetTheme
}: Props) {
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button className="w-full lg:w-fit">
          <Layers className="mr-2 w-4 h-4" />
          Entity Management
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full lg:w-2/5">
        <DialogHeader>
          <DialogTitle>Media Entity Management</DialogTitle>
          <DialogDescription>
            Manage created entities from added media
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="authors">
          <TabsList className="w-full lg:w-fit">
            <TabsTrigger value="authors">Authors</TabsTrigger>
            <TabsTrigger value="genres">Genres</TabsTrigger>
            <TabsTrigger value="studios">Studios</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
          </TabsList>
          <AuthorManagement resetParent={resetAuthor} />
          <GenreManagement resetParent={resetGenre} />
          <StudioManagement resetParent={resetStudio} />
          <ThemeManagement resetParent={resetTheme} />
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
