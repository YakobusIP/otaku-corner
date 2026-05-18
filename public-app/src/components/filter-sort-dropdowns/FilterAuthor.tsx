"use client";

import { useState } from "react";

import { authorService } from "@/services/entity.service";

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

import { AuthorEntity } from "@/types/entity.type";

import { cn } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type Props = {
  selectedAuthor?: number;
  handleFilterAuthor: (key?: number) => void;
};

export default function FilterAuthor({
  selectedAuthor,
  handleFilterAuthor
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: authorList, error } = useQuery({
    queryKey: ["authors"],
    queryFn: () => authorService.fetchAll<AuthorEntity>(),
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
            {authorList?.find((author) => author.id === selectedAuthor)?.name ||
              "Author"}
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
          <CommandInput placeholder="Search author..." />
          <CommandList>
            <CommandEmpty>No author found.</CommandEmpty>
            <CommandGroup>
              {authorList?.map((author) => {
                return (
                  <CommandItem
                    key={author.id}
                    value={author.name}
                    onSelect={(currentValue) => {
                      const currentValueAuthor = authorList.find(
                        (g) => g.name === currentValue
                      );
                      if (currentValueAuthor) {
                        if (currentValueAuthor.id === selectedAuthor) {
                          handleFilterAuthor(undefined);
                        } else {
                          handleFilterAuthor(currentValueAuthor.id);
                        }
                      } else {
                        handleFilterAuthor(undefined);
                      }
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedAuthor === author.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <p className="whitespace-normal">{author.name}</p>
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
