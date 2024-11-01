module.exports = {
  root: true,
  env: { node: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:node/recommended"
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }
    ], // Warn on unused variables
    "node/no-unsupported-features/es-syntax": "off", // Disable this to allow ES Modules syntax
    "node/no-missing-import": "off", // Turn off because TypeScript resolves imports
    "node/no-unsupported-features/es-builtins": "off",
    "node/no-unpublished-import": "off",
    "no-process-exit": "off"
  }
};
