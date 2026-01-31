<<<<<<< HEAD
import { defineConfig } from "eslint/config";
=======
import { defineConfig, globalIgnores } from "eslint/config";
>>>>>>> 02bdcb7 (Initial commit)
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
<<<<<<< HEAD
  {
    ignores: [
      ".next/**",
      "out/**", 
      "build/**",
      "next-env.d.ts",
    ]
  }
=======
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
>>>>>>> 02bdcb7 (Initial commit)
]);

export default eslintConfig;
