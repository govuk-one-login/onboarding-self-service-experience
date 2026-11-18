import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        include: ["**/*.test.ts"],
        coverage: {
            include: ["**/*.ts"],
            exclude: ["**/*.d.ts", "**/tests/**/*"],
            reporter: ["lcov", "text"]
        },
        globals: true,
        setupFiles: ["tests/setup.ts"]
    },
    define: {}
});
