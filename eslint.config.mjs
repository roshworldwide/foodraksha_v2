import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      // CLAUDE.md: no `any`, no silent `catch {}`.
      "@typescript-eslint/no-explicit-any": "error",
      // Server action signatures require positional arguments the body does
      // not use; an underscore marks them deliberate.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // PDF templates: <Image> here is @react-pdf's, not the DOM's — it takes
    // no alt text because a PDF has no accessibility tree to put it in.
    files: ["src/components/pdf/**/*.tsx"],
    rules: { "jsx-a11y/alt-text": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored client design source — reference only, never built or linted.
    "docs/client-design/**",
  ]),
]);

export default eslintConfig;
