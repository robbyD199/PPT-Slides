// ESLint flat config used by `npm run lint` (office-addin-lint picks up this file automatically).
import officeAddins from "eslint-plugin-office-addins";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  ...officeAddins.configs.recommended,
  {
    plugins: {
      "office-addins": officeAddins,
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        Office: "readonly",
        PowerPoint: "readonly",
        OfficeExtension: "readonly",
      },
    },
    rules: {
      // TypeScript already reports undefined identifiers (incl. DOM types)
      "no-undef": "off",
    },
  },
];
