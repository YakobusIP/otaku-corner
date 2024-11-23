import { Dispatch, SetStateAction, useCallback, useState } from "react";

import LogoutButton from "@/components/LogoutButton";
import MediaFilter from "@/components/MediaFilter";
import AddAnimeDialog from "@/components/add-anime/AddAnimeDialog";
import AddLightNovelDialog from "@/components/add-lightnovel/AddLightNovelDialog";
import AddMangaDialog from "@/components/add-manga/AddMangaDialog";
import EntityManagement from "@/components/entity-management/EntityManagement";
import { Button } from "@/components/ui/button";
import { DropdownChecked } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger
} from "@/components/ui/sheet";

import useWideScreen from "@/hooks/useWideScreen";

import {
  ChartNoAxesCombinedIcon,
  GlobeIcon,
  MenuIcon,
  SearchIcon
} from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  mediaFilters: DropdownChecked[];
  setMediaFilters: Dispatch<SetStateAction<DropdownChecked[]>>;
  setSearchMedia: Dispatch<SetStateAction<string>>;
  fetchAnimeList: () => Promise<void>;
  fetchGenreList: () => Promise<void>;
  fetchStudioList: () => Promise<void>;
  fetchThemeList: () => Promise<void>;
  fetchMangaList: () => Promise<void>;
  fetchAuthorList: () => Promise<void>;
  fetchLightNovelList: () => Promise<void>;
};

export default function MediaListNavbar({
  mediaFilters,
  setMediaFilters,
  setSearchMedia,
  fetchAnimeList,
  fetchGenreList,
  fetchStudioList,
  fetchThemeList,
  fetchMangaList,
  fetchAuthorList,
  fetchLightNovelList
}: Props) {
  const isWideScreen = useWideScreen();

  const [openAddAnimeDialog, setOpenAddAnimeDialog] = useState(false);
  const [openAddMangaDialog, setOpenAddMangaDialog] = useState(false);
  const [openAddLightNovelDialog, setOpenAddLightNovelDialog] = useState(false);
  const [openEntityManagementDialog, setOpenEntityManagementDialog] =
    useState(false);

  const handleMediaFilters = (index: number, checked: DropdownChecked) => {
    setMediaFilters((prevFilters) =>
      prevFilters.map((state, i) => (i === index ? checked : state))
    );
  };

  const resetAnimeParent = useCallback(async () => {
    await fetchAnimeList();
    await fetchGenreList();
    await fetchStudioList();
    await fetchThemeList();
  }, [fetchAnimeList, fetchGenreList, fetchStudioList, fetchThemeList]);

  const resetMangaParent = useCallback(async () => {
    await fetchMangaList();
    await fetchAuthorList();
    await fetchGenreList();
    await fetchThemeList();
  }, [fetchMangaList, fetchAuthorList, fetchGenreList, fetchThemeList]);

  const resetLightNovelParent = useCallback(async () => {
    await fetchLightNovelList();
    await fetchAuthorList();
    await fetchGenreList();
    await fetchThemeList();
  }, [fetchLightNovelList, fetchAuthorList, fetchGenreList, fetchThemeList]);

  return isWideScreen ? (
    <header className="flex items-center bg-background border-b">
      <img src="/logo.png" className="w-32 mt-0 ml-2" />
      <div className="flex items-center justify-between w-full p-3 xl:pl-2 xl:pr-4 xl:py-4">
        <div className="flex flex-col xl:flex-row items-center w-full gap-4">
          <div className="flex w-full xl:w-fit gap-2 xl:gap-4">
            <Input
              type="text"
              placeholder="Search"
              startIcon={SearchIcon}
              parentClassName="w-full xl:w-fit"
              className="w-full xl:w-[300px]"
              onChange={(e) => setSearchMedia(e.target.value)}
            />
            <MediaFilter
              mediaFilters={mediaFilters}
              handleMediaFilters={handleMediaFilters}
            />
          </div>
          <AddAnimeDialog
            openDialog={openAddAnimeDialog}
            setOpenDialog={setOpenAddAnimeDialog}
            resetParent={resetAnimeParent}
          />
          <AddMangaDialog
            openDialog={openAddMangaDialog}
            setOpenDialog={setOpenAddMangaDialog}
            resetParent={resetMangaParent}
          />
          <AddLightNovelDialog
            openDialog={openAddLightNovelDialog}
            setOpenDialog={setOpenAddLightNovelDialog}
            resetParent={resetLightNovelParent}
          />
          <EntityManagement
            openDialog={openEntityManagementDialog}
            setOpenDialog={setOpenEntityManagementDialog}
            resetAuthor={fetchAuthorList}
            resetGenre={fetchGenreList}
            resetStudio={fetchStudioList}
            resetTheme={fetchThemeList}
          />
          <Link to="/dashboard" className="w-full xl:w-fit">
            <Button className="w-full">
              <ChartNoAxesCombinedIcon className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
          <Link
            to={import.meta.env.VITE_PUBLIC_APP}
            className="w-full xl:w-fit"
            target="_blank"
          >
            <Button className="w-full">
              <GlobeIcon className="w-4 h-4" /> Public App
            </Button>
          </Link>
        </div>
        <LogoutButton />
      </div>
    </header>
  ) : (
    <header className="flex items-center justify-between bg-background border-b p-2 gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader className="items-center">
            <img src="/logo.png" className="w-32 my-2" />
          </SheetHeader>
          <div className="flex flex-col gap-2 my-2">
            <Label>Media Control</Label>
            <AddAnimeDialog
              openDialog={openAddAnimeDialog}
              setOpenDialog={setOpenAddAnimeDialog}
              resetParent={resetAnimeParent}
            />
            <AddMangaDialog
              openDialog={openAddMangaDialog}
              setOpenDialog={setOpenAddMangaDialog}
              resetParent={resetMangaParent}
            />
            <AddLightNovelDialog
              openDialog={openAddLightNovelDialog}
              setOpenDialog={setOpenAddLightNovelDialog}
              resetParent={resetLightNovelParent}
            />
            <Separator />
            <Label>Entity Control</Label>
            <EntityManagement
              openDialog={openEntityManagementDialog}
              setOpenDialog={setOpenEntityManagementDialog}
              resetAuthor={fetchAuthorList}
              resetGenre={fetchGenreList}
              resetStudio={fetchStudioList}
              resetTheme={fetchThemeList}
            />
            <Separator />
            <Label>Others</Label>
            <Link to="/dashboard" className="w-full xl:w-fit">
              <Button className="w-full" variant="outline">
                <ChartNoAxesCombinedIcon className="w-4 h-4" /> Dashboard
              </Button>
            </Link>
            <Link
              to={import.meta.env.VITE_PUBLIC_APP}
              className="w-full xl:w-fit"
              target="_blank"
            >
              <Button className="w-full" variant="outline">
                <GlobeIcon className="w-4 h-4" /> Public App
              </Button>
            </Link>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <LogoutButton />
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <div className="flex w-full xl:w-fit gap-2 xl:gap-4">
        <Input
          type="text"
          placeholder="Search"
          startIcon={SearchIcon}
          parentClassName="w-full xl:w-fit"
          className="w-full xl:w-[300px]"
          onChange={(e) => setSearchMedia(e.target.value)}
        />
        <MediaFilter
          mediaFilters={mediaFilters}
          handleMediaFilters={handleMediaFilters}
        />
      </div>
    </header>
  );
}
