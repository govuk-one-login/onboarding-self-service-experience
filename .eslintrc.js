module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.eslint.json", "ui-automation-tests/tsconfig.json", "backend/**/tsconfig.json", "express/tsconfig.json"],
        sourceType: "module",
        ecmaVersion: 2020,
        ecmaFeatures: {
            impliedStrict: true
        }
    },
    plugins: ["@typescript-eslint"],
    extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
    ignorePatterns: ["node_modules", ".aws-sam", "dist"]
};
