import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-explicit-any": "warn", // Allow any but warn
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/prefer-const": "error",
      "@typescript-eslint/no-inferrable-types": "off", // Allow explicit types during migration
      
      // Disable problematic rules during migration
      "@typescript-eslint/no-implicit-any-catch": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      
      // React specific
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off", // Not needed with TypeScript
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "typescript-conversion.md",
      "convert-to-typescript.sh",
    ],
  },
];

export default eslintConfig;
