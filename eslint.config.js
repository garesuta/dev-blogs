import astroPlugin from "eslint-plugin-astro";
import vuePlugin from "eslint-plugin-vue";
import tsParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";

export default [
  // Global TypeScript rules
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parser: tsParser,
    },
  },
  // Vue Rules
  ...vuePlugin.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  // Astro Rules (flat/recommended already wires astro-eslint-parser for .astro files)
  ...astroPlugin.configs["flat/recommended"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  // Global Ignores
  {
    ignores: ["dist/", ".astro/", "node_modules/", "drizzle/"],
  },
];
