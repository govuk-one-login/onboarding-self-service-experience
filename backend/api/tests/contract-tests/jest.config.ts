import {Config} from "jest";

export default {
    rootDir: ".",
    clearMocks: true,
    moduleDirectories: ["node_modules", "src"],
    collectCoverageFrom: ["*/**/*.ts", "!*/**/*.d.ts", "!**/tests/**/*"],
    displayName: "api pact-tests",
    preset: "ts-jest",
    testTimeout: 200000,
    transform: {
        "^.+\\.(ts|tsx)?$": "ts-jest",
        "^.+\\.(js|jsx)$": "babel-jest"
    }
} satisfies Config;
