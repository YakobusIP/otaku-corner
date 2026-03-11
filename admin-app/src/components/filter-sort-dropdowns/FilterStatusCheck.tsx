import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { GenericKeyLabel } from "@/types/general.type";

type Props = {
  selectedStatusCheck?: GenericKeyLabel["key"];
  handleFilterStatusCheck: (key?: GenericKeyLabel["key"]) => void;
};

const items: GenericKeyLabel[] = [
  { key: "complete", label: "Completed" },
  { key: "incomplete", label: "Incomplete" }
];

export default function FilterStatusCheck({
  selectedStatusCheck,
  handleFilterStatusCheck
}: Props) {
  return (
    <FilterPopover<GenericKeyLabel, GenericKeyLabel["key"]>
      selectedKey={selectedStatusCheck}
      onChange={(key) => handleFilterStatusCheck(key)}
      items={items}
      getKey={(s) => s.key}
      getLabel={(s) => s.label}
      placeholder="Search status check..."
      buttonFallbackLabel="Status check"
      emptyText="No status check found."
      showAllOption
      allOptionLabel="All status checks"
    />
  );
}
