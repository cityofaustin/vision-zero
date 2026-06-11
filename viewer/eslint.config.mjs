import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

/**
 * This file's extension is updated to .mjs to workaround ESLint's MODULE_TYPELESS_PACKAGE_JSON warning.
 * We could use a package.json with "type": "module" (https://nodejs.org/api/packages.html#type) but this
 * is a project-wide change that needs more evaluation.
 */

export default defineConfig(
  {
    ignores: ["dist", "node_modules", "coverage", "build"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      // Flag anything that violates the rules of hooks
      reactHooks.configs.flat.recommended,
      // Flag anything that could break Vite's HMR (Hot Module Replacement)
      reactRefresh.configs.vite,
      prettierConfig, // Must be last to disable conflicting rules
    ],

    // React plugin for additional rules not in hooks
    plugins: {
      react: reactPlugin,
    },

    // Language and parser settings (tseslint handles parser)
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
      // parserOptions automatically handled by tseslint
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      // React specific rules (not covered by hooks preset)
      "react-hooks/rules-of-hooks": "error",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error", // Prevents false "unused variable" errors
      "react/jsx-no-target-blank": "error", // Security: prevents tabnabbing attacks
      "react/display-name": "off",
      "react/prop-types": "off", // Using TypeScript instead of PropTypes
      "no-unused-vars": "off", // Disable the JavaScript version
      "@typescript-eslint/no-unused-vars": "error", // TypeScript-aware unused vars (replaces no-unused-vars)

      // Override hook rule severity if needed
      "react-hooks/exhaustive-deps": "warn",
    },
  }
);
