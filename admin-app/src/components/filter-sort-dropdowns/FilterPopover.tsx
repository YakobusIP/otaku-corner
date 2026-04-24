import { useEffect, useMemo, useState } from "react";

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

import { useToast } from "@/hooks/useToast";

import { cn } from "@/lib/utils";

import { QueryKey, UseQueryOptions, useQuery } from "@tanstack/react-query";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

type QueryConfig<T> = {
  queryKey: QueryKey;
  queryFn: () => Promise<T[]>;
} & Omit<UseQueryOptions<T[], unknown, T[], QueryKey>, "queryKey" | "queryFn">;

type Props<T, K extends string | number> = {
  selectedKey?: K;
  onChange: (key?: K, item?: T) => void;

  items?: T[];
  query?: QueryConfig<T>;

  getKey: (item: T) => K;
  getLabel: (item: T) => string;

  title?: string;
  placeholder?: string;
  emptyText?: string;
  buttonFallbackLabel?: string;
  buttonClassName?: string;

  showAllOption?: boolean;
  allOptionLabel?: string;
};

export default function FilterPopover<T, K extends string | number>({
  selectedKey,
  onChange,
  items,
  query,
  getKey,
  getLabel,
  title = "Filter by",
  placeholder,
  emptyText,
  buttonFallbackLabel,
  buttonClassName,
  showAllOption = false,
  allOptionLabel
}: Props<T, K>) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const { data, error } = useQuery({
    enabled: !!query,
    ...(query || ({} as QueryConfig<T>))
  }) as { data?: T[]; error: Error | null };

  const options: T[] | undefined = useMemo(() => data ?? items, [data, items]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: error.message
      });
    }
  }, [error, toast]);

  const selected = useMemo(() => {
    if (!options || selectedKey === undefined) return undefined;
    return options.find((o) => getKey(o) === selectedKey);
  }, [options, selectedKey, getKey]);

  const buttonLabel = selected ? getLabel(selected) : buttonFallbackLabel;

  const handlePick = (item?: T) => {
    if (!item) {
      onChange(undefined, undefined);
      setIsOpen(false);
      return;
    }

    const key = getKey(item);
    if (selectedKey !== undefined && key === selectedKey) {
      onChange(undefined, undefined);
    } else {
      onChange(key, item);
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full", buttonClassName)}
        >
          <p className="truncate text-center">
            {title}: {buttonLabel}
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
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {showAllOption && (
                <CommandItem
                  value="__ALL__"
                  onSelect={() => handlePick(undefined)}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedKey === undefined ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="whitespace-normal">{allOptionLabel}</span>
                </CommandItem>
              )}

              {options?.map((item) => {
                const key = getKey(item);
                const label = getLabel(item);
                return (
                  <CommandItem
                    key={key}
                    value={label}
                    onSelect={() => handlePick(item)}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedKey === key ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <p className="whitespace-normal">{label}</p>
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
