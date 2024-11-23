import { Dispatch, SetStateAction } from "react";

import AuthorManagement from "@/components/entity-management/author-management/AuthorManagement";
import GenreManagement from "@/components/entity-management/genre-management/GenreManagement";
import StudioManagement from "@/components/entity-management/studio-management/StudioManagement";
import ThemeManagement from "@/components/entity-management/theme-management/ThemeManagement";
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

import useWideScreen from "@/hooks/useWideScreen";

import { LayersIcon } from "lucide-react";

import { ScrollArea } from "../ui/scroll-area";

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
  const isWideScreen = useWideScreen();

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button
          className="w-full xl:w-fit"
          variant={isWideScreen ? "default" : "outline"}
        >
          <LayersIcon className="w-4 h-4" />
          Entity Management
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full xl:w-2/5">
        <DialogHeader>
          <DialogTitle>Media Entity Management</DialogTitle>
          <DialogDescription>
            Manage created entities from added media
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="authors">
          <TabsList className="w-full xl:w-fit">
            <TabsTrigger value="authors">Authors</TabsTrigger>
            <TabsTrigger value="genres">Genres</TabsTrigger>
            <TabsTrigger value="studios">Studios</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[28rem]">
            <AuthorManagement resetParent={resetAuthor} />
            <GenreManagement resetParent={resetGenre} />
            <StudioManagement resetParent={resetStudio} />
            <ThemeManagement resetParent={resetTheme} />
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
