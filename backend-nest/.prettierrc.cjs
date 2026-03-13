module.exports = {
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  trailingComma: "none",
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  importOrder: [
    "^node:",
    "^@nestjs/(.*)$",
    "^@/common/(.*)$",
    "^@/prisma/(.*)$",
    "^@/auth/(.*)$",
    "^@/(.*)$",
    "<THIRD_PARTY_MODULES>",
    "^[./]"
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["typescript", "decorators-legacy"]
};
