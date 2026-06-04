import FilterPopover from "@/components/filter-sort-dropdowns/FilterPopover";

import { ScoreOption } from "@/types/general.type";

import { scoreOptions } from "@/lib/constants";

type Props = {
  selectedMALScore?: ScoreOption["key"];
  handleFilterMALScore: (key?: ScoreOption["key"]) => void;
};
export default function FilterMALScore({
  selectedMALScore,
  handleFilterMALScore
}: Props) {
  return (
    <FilterPopover<ScoreOption, ScoreOption["key"]>
      selectedKey={selectedMALScore}
      onChange={(key) => handleFilterMALScore(key)}
      items={scoreOptions}
      getKey={(o) => o.key}
      getLabel={(o) => o.optionLabel}
      placeholder="Search MAL score..."
      buttonFallbackLabel="MAL score"
      emptyText="No MAL score found."
      showAllOption
      allOptionLabel="All MAL scores"
    />
  );
}
