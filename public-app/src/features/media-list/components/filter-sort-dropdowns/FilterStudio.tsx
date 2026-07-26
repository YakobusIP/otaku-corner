"use client";

import { useState } from "react";

import { studioService } from "@/services/entity.service";

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

import { StudioEntity } from "@/types/entity.type";

import { cn } from "@/lib/shared/utils";

import { useQuery } from "@tanstack/react-query";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type Props = {
  selectedStudio?: number;
  handleFilterStudio: (key?: number) => void;
};

export default function FilterStudio({
  selectedStudio,
  handleFilterStudio
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: studioList, error } = useQuery({
    queryKey: ["studios"],
    queryFn: () => studioService.fetchAll<StudioEntity>(),
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
            {studioList?.find((studio) => studio.id === selectedStudio)?.name ||
              "Studio"}
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
          <CommandInput placeholder="Search studio..." />
          <CommandList>
            <CommandEmpty>No genre found.</CommandEmpty>
            <CommandGroup>
              {studioList?.map((studio) => {
                return (
                  <CommandItem
                    key={studio.id}
                    value={studio.name}
                    onSelect={(currentValue) => {
                      const currentValueStudio = studioList.find(
                        (g) => g.name === currentValue
                      );
                      if (currentValueStudio) {
                        if (currentValueStudio.id === selectedStudio) {
                          handleFilterStudio(undefined);
                        } else {
                          handleFilterStudio(currentValueStudio.id);
                        }
                      } else {
                        handleFilterStudio(undefined);
                      }
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedStudio === studio.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <p className="whitespace-normal">{studio.name}</p>
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
