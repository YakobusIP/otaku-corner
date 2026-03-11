import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { PROGRESS_STATUS } from "@/lib/enums";

type Props = {
  selectedProgressStatus?: keyof typeof PROGRESS_STATUS;
  handleFilterProgressStatus: (key?: keyof typeof PROGRESS_STATUS) => void;
};

type ProgressOption = {
  key: keyof typeof PROGRESS_STATUS;
  label: string;
};

const items: ProgressOption[] = (
  Object.keys(PROGRESS_STATUS) as Array<keyof typeof PROGRESS_STATUS>
).map((k) => ({ key: k, label: PROGRESS_STATUS[k] }));

export default function FilterProgressStatus({
  selectedProgressStatus,
  handleFilterProgressStatus
}: Props) {
  return (
    <FilterPopover<ProgressOption, ProgressOption["key"]>
      selectedKey={selectedProgressStatus}
      onChange={(key) => handleFilterProgressStatus(key)}
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
