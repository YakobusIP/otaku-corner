import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { GenericKeyLabel } from "@/types/general.type";

type Props = {
  selectedType?: GenericKeyLabel["key"];
  handleFilterType: (key?: GenericKeyLabel["key"]) => void;
};

const items: GenericKeyLabel[] = [
  { key: "TV", label: "TV" },
  { key: "OVA", label: "OVA" },
  { key: "Movie", label: "Movie" }
];

export default function FilterType({ selectedType, handleFilterType }: Props) {
  return (
    <FilterPopover<GenericKeyLabel, GenericKeyLabel["key"]>
      selectedKey={selectedType}
      onChange={(key) => handleFilterType(key)}
      items={items}
      getKey={(o) => o.key}
      getLabel={(o) => o.label}
      placeholder="Search type..."
      buttonFallbackLabel="Type"
      emptyText="No type found."
      showAllOption
      allOptionLabel="All types"
    />
  );
}
