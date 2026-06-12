export const ratingDescriptions: { [key: number]: string } = {
  0: "Abysmal",
  1: "Terrible",
  2: "Horrible",
  3: "Bad",
  4: "Poor",
  5: "Average",
  6: "Decent",
  7: "Good",
  8: "Great",
  9: "Excellent",
  10: "Masterpiece"
};

export const scoreOptions = [
  {
    key: "poor",
    label: "Poor",
    optionLabel: "Poor (1 - 3)",
    min: 1,
    max: 3.99
  },
  {
    key: "average",
    label: "Average",
    optionLabel: "Average (4 - 6)",
    min: 4,
    max: 6.99
  },
  {
    key: "good",
    label: "Good",
    optionLabel: "Good (7 - 8)",
    min: 7,
    max: 8.99
  },
  {
    key: "excellent",
    label: "Excellent",
    optionLabel: "Excellent (9 - 10)",
    min: 9,
    max: 10
  }
];

export const URL_OF_SITEMAPS = 50000;
