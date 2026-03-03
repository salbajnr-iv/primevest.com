import { defineConfig } from "eslint/config";02bdcb7 (Initial commit)
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      "out/**", 
      "build/**",
      "next-env.d.ts",
    ]
  }02bdcb7 (Initial commit)
]);

export default eslintConfig;
