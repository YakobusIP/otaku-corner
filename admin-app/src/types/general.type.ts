type ScoreOption = {
  key: "poor" | "average" | "good" | "excellent";
  label: string;
  optionLabel: string;
  min: number;
  max: number;
};

type GenericKeyLabel = {
  key: string;
  label: string;
};

export type { ScoreOption, GenericKeyLabel };
