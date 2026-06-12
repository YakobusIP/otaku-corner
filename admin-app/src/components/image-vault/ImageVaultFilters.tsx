import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { useImageVaultFilters } from "@/components/context/ImageVaultFiltersContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  useImageVaultCategories,
  useImageVaultModels
} from "@/hooks/useImageVaultQueries";

import type { ImageOriginType } from "@/types/image-vault.type";

import { useDebounce } from "use-debounce";

export default function ImageVaultFilters() {
  const { state, setState } = useImageVaultFilters();
  const { data: models = [] } = useImageVaultModels(true);
  const { data: categories = [] } = useImageVaultCategories(true);

  const [localSearch, setLocalSearch] = useState(state.search);
  const [debouncedSearch] = useDebounce(localSearch, 300);
  const lastPushedSearchRef = useRef(state.search);

  useEffect(() => {
    if (debouncedSearch === lastPushedSearchRef.current) return;
    if (debouncedSearch !== localSearch) return;
    setState({ search: debouncedSearch });
    lastPushedSearchRef.current = debouncedSearch;
  }, [debouncedSearch, localSearch, setState]);

  useEffect(() => {
    if (state.search === lastPushedSearchRef.current) {
      return;
    }
    setLocalSearch(state.search);
    lastPushedSearchRef.current = state.search;
  }, [state.search]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

  return (
    <div className="grid gap-3 rounded-lg border border-border/60 bg-card/40 p-4 md:grid-cols-2 xl:grid-cols-5">
      <div className="space-y-2 xl:col-span-2">
        <Label htmlFor="vault-search">Search</Label>
        <Input
          id="vault-search"
          value={localSearch}
          onChange={handleSearchChange}
          placeholder="Prompt, source URL, or notes"
        />
      </div>
      <div className="space-y-2">
        <Label>Origin</Label>
        <Select
          value={state.originType}
          onValueChange={(value) =>
            setState({ originType: value as ImageOriginType | "all" })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="AI">AI</SelectItem>
            <SelectItem value="HUMAN">Human</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Model</Label>
        <Select
          value={state.modelId || "all"}
          onValueChange={(value) =>
            setState({ modelId: value === "all" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All models" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All models</SelectItem>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={state.categoryId || "all"}
          onValueChange={(value) =>
            setState({ categoryId: value === "all" ? "" : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:col-span-2 xl:col-span-5">
        <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2">
          <Checkbox
            id="vault-explicit-only"
            checked={state.explicitOnly}
            onCheckedChange={(checked) =>
              setState({ explicitOnly: checked === true })
            }
          />
          <Label htmlFor="vault-explicit-only">Explicit only</Label>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2">
          <Checkbox
            id="vault-hide-explicit"
            checked={state.hideExplicitImages}
            onCheckedChange={(checked) =>
              setState({ hideExplicitImages: checked === true })
            }
          />
          <Label htmlFor="vault-hide-explicit">Hide explicit images</Label>
        </div>
      </div>
    </div>
  );
}
