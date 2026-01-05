import astroPlugin from "eslint-plugin-astro";
import vuePlugin from "eslint-plugin-vue";
import tsParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";

export default [
  // Global TypeScript rules
  {
    files: ["**/*.{js,ts,vue,astro}"],
    languageOptions: {
      parser: tsParser,
      extraFileExtensions: [".vue", ".astro"],
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
  // Astro Rules
  ...astroPlugin.configs["flat/recommended"],
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  // 4. Global Ignores
  {
    ignores: ["dist/", ".astro/", "node_modules/", "drizzle/"],
  },
];
