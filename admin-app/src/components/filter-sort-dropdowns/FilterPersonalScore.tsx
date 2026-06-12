import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { ScoreOption } from "@/types/general.type";

import { scoreOptions } from "@/lib/constants";

type Props = {
  selectedPersonalScore?: ScoreOption["key"];
  handleFilterPersonalScore: (key?: ScoreOption["key"]) => void;
};

export default function FilterPersonalScore({
  selectedPersonalScore,
  handleFilterPersonalScore
}: Props) {
  return (
    <FilterPopover<ScoreOption, ScoreOption["key"]>
      selectedKey={selectedPersonalScore}
      onChange={(key) => handleFilterPersonalScore(key)}
      items={scoreOptions}
      getKey={(o) => o.key}
      getLabel={(o) => o.optionLabel}
      placeholder="Search personal score..."
      buttonFallbackLabel="Personal score"
      emptyText="No personal score found."
      showAllOption
      allOptionLabel="All personal scores"
    />
  );
}
