"use client";

import { useState } from "react";

import { themeService } from "@/services/entity.service";

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

import { ThemeEntity } from "@/types/entity.type";

import { cn } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type Props = {
  selectedTheme?: number;
  handleFilterTheme: (key?: number) => void;
};

export default function FilterTheme({
  selectedTheme,
  handleFilterTheme
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: themeList, error } = useQuery({
    queryKey: ["themes"],
    queryFn: () => themeService.fetchAll<ThemeEntity>(),
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
            {themeList?.find((theme) => theme.id === selectedTheme)?.name ||
              "Theme"}
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
          <CommandInput placeholder="Search theme..." />
          <CommandList>
            <CommandEmpty>No theme found.</CommandEmpty>
            <CommandGroup>
              {themeList?.map((theme) => {
                return (
                  <CommandItem
                    key={theme.id}
                    value={theme.name}
                    onSelect={(currentValue) => {
                      const currentValueTheme = themeList.find(
                        (g) => g.name === currentValue
                      );
                      if (currentValueTheme) {
                        if (currentValueTheme.id === selectedTheme) {
                          handleFilterTheme(undefined);
                        } else {
                          handleFilterTheme(currentValueTheme.id);
                        }
                      } else {
                        handleFilterTheme(undefined);
                      }
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTheme === theme.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <p className="whitespace-normal">{theme.name}</p>
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
