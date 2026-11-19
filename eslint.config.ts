import {defineConfig} from "eslint/config";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";

export default defineConfig(
    {
        files: ["**/*.ts", "**/*.js"],
        extends: [...tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: "latest",
            parser: tsParser
        },
        rules: {
            "@typescript-eslint/no-var-requires": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_"
                }
            ]
        }
    },
    {
        ignores: [
            "tsconfig.json",
            "eslint.config.ts",
            "*.d.ts",
            "node_modules",
            "**/dist",
            "**/coverage/**",
            ".aws-sam",
            "build",
            "**/style.ts",
            "*.json",
            "*.html"
        ]
    }
);
