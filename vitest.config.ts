import {defineConfig} from "vitest/config";
import {fileURLToPath} from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias: [
            {find: /^config\//, replacement: `${root}/express/src/config/`},
            {find: /^lib\//, replacement: `${root}/express/src/lib/`}
        ]
    },
    test: {
        clearMocks: true,
        globals: true,
        include: ["**/*.{test,spec}.ts"],
        setupFiles: ["./express/tests/setup.ts", "./backend/api/tests/setup.ts", "./express/src/config/express.ts"]
    }
});
