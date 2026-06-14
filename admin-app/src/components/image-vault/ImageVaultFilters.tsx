import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { useImageVaultFilters } from "@/components/context/ImageVaultFiltersContext";
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

import {
  IMAGE_VAULT_SAFETY_LEVELS,
  IMAGE_VAULT_SAFETY_LEVEL_LABELS,
  SENSITIVE_IMAGE_VISIBILITY_LABELS,
  SENSITIVE_IMAGE_VISIBILITY_OPTIONS,
  parseOriginFilter,
  parseSafetyFilter,
  parseSensitiveImageVisibility
} from "@/types/image-vault.type";

import { SearchIcon } from "lucide-react";
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
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-card/40 p-4 xl:grid-cols-4">
      <div className="col-span-2 space-y-2 xl:col-span-4">
        <Label htmlFor="vault-search">Search</Label>
        <div className="relative">
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="vault-search"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Prompt, source URL, or notes"
            className="pl-9"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Origin</Label>
        <Select
          value={state.originType}
          onValueChange={(value) =>
            setState({ originType: parseOriginFilter(value) })
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
        <Label>Safety</Label>
        <Select
          value={state.safetyFilter}
          onValueChange={(value) =>
            setState({ safetyFilter: parseSafetyFilter(value) })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {IMAGE_VAULT_SAFETY_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {IMAGE_VAULT_SAFETY_LEVEL_LABELS[level]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Visibility</Label>
        <Select
          value={state.sensitiveImageVisibility}
          onValueChange={(value) => {
            const parsed = parseSensitiveImageVisibility(value);
            if (parsed) {
              setState({ sensitiveImageVisibility: parsed });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SENSITIVE_IMAGE_VISIBILITY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {SENSITIVE_IMAGE_VISIBILITY_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 space-y-2 xl:col-span-4">
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
    </div>
  );
}
