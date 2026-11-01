const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");

module.exports = [
  { ignores: ["node_modules/**", "coverage/**", "prisma/migrations/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", ignoreRestSiblings: true }],
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  {
    // Jest inyecta describe, test, expect y jest como globales
    files: ["tests/**/*.js"],
    languageOptions: { globals: { ...globals.jest } },
  },
  // Desactiva las reglas de estilo que chocan con Prettier (siempre al final)
  prettier,
];
