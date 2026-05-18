"use client";

import { useState } from "react";

import { genreService } from "@/services/entity.service";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";

import { GenreEntity } from "@/types/entity.type";

import { cn } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type Props = {
  selectedGenre?: number;
  handleFilterGenre: (key?: number) => void;
};

export default function FilterGenre({
  selectedGenre,
  handleFilterGenre
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: genreList, error } = useQuery({
    queryKey: ["genres"],
    queryFn: () => genreService.fetchAll<GenreEntity>(),
    refetchOnWindowFocus: false,
    staleTime: 24 * 60 * 60 * 1000
  });

  useQueryErrorToast(error);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full">
          <p className="truncate text-center">
            Filter by:{" "}
            {genreList?.find((genre) => genre.id === selectedGenre)?.name ||
              "Genre"}
          </p>
          {isOpen ? (
            <ChevronUpIcon className="ml-2 h-4 w-4 shrink-0" />
          ) : (
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="popover-content-width-full p-0">
        <Command>
          <CommandInput placeholder="Search genre..." />
          <CommandList>
            <CommandEmpty>No genre found.</CommandEmpty>
            <CommandGroup>
              {genreList?.map((genre) => {
                return (
                  <CommandItem
                    key={genre.id}
                    value={genre.name}
                    onSelect={(currentValue) => {
                      const currentValueGenre = genreList.find(
                        (g) => g.name === currentValue
                      );
                      if (currentValueGenre) {
                        if (currentValueGenre.id === selectedGenre) {
                          handleFilterGenre(undefined);
                        } else {
                          handleFilterGenre(currentValueGenre.id);
                        }
                      } else {
                        handleFilterGenre(undefined);
                      }
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedGenre === genre.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <p className="whitespace-normal">{genre.name}</p>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
