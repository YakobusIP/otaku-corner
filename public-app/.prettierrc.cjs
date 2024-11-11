module.exports = {
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  trailingComma: "none",
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  importOrder: [
    "^react$",
    "^@/app/(.*)$",
    "^@/services/(.*)$",
    "^@/components/(.*)$",
    "^@/hooks/(.*)$",
    "^@/types/(.*)$",
    "^@/lib/(.*)$",
    "<THIRD_PARTY_MODULES>",
    "^[./]"
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true
};
